#!/usr/bin/env python3
import argparse
import os
import subprocess
import psycopg2
from psycopg2.extras import RealDictCursor

DB = os.environ.get('ALEXANDRIA_DSN', 'postgresql://alexandria:alex_bulk_2026@localhost:5432/alexandria_papers')


def qident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def get_contract(cur, source_key: str, field_name: str):
    cur.execute(
        """
        SELECT id, source_key, table_name, field_name, embedding_column, embedding_space,
               embedding_model, embedding_dim, embedding_normalized, embedding_text_version
        FROM embedding_space_contracts
        WHERE source_key = %s AND field_name = %s
        """,
        (source_key, field_name),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f'No embedding contract for {source_key}.{field_name}')
    return row


def get_constraint(cur, table_name: str, constraint_name: str):
    cur.execute(
        """
        SELECT conname, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = %s::regclass AND conname = %s
        """,
        (table_name, constraint_name),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f'Constraint {constraint_name} not found on {table_name}')
    return row


def get_version_counts(cur, table_name: str, embedding_column: str, version_column: str):
    cur.execute(
        f"SELECT {qident(version_column)}, COUNT(*) FROM {qident(table_name)} WHERE {qident(embedding_column)} IS NOT NULL GROUP BY 1 ORDER BY 1"
    )
    return cur.fetchall()


def build_constraint_sql(table_name: str, constraint_name: str, embedding_column: str, model_column: str, space_column: str, dim_column: str, normalized_column: str, version_column: str, allow_versions):
    versions_sql = ', '.join("'%s'" % v.replace("'", "''") for v in allow_versions)
    return f"""
        ALTER TABLE {qident(table_name)}
        ADD CONSTRAINT {qident(constraint_name)} CHECK (
          {qident(embedding_column)} IS NULL OR (
            {qident(model_column)} = %s AND
            {qident(space_column)} = %s AND
            {qident(dim_column)} = %s AND
            {qident(normalized_column)} = %s AND
            {qident(version_column)} IN ({versions_sql})
          )
        )
    """


def relax_constraint(cur, table_name: str, constraint_name: str, embedding_column: str, model_column: str, space_column: str, dim_column: str, normalized_column: str, version_column: str, model: str, space: str, dim: int, normalized: bool, versions):
    cur.execute(f"ALTER TABLE {qident(table_name)} DROP CONSTRAINT {qident(constraint_name)}")
    cur.execute(
        build_constraint_sql(table_name, constraint_name, embedding_column, model_column, space_column, dim_column, normalized_column, version_column, versions),
        (model, space, dim, normalized),
    )


def tighten_constraint(cur, table_name: str, constraint_name: str, embedding_column: str, model_column: str, space_column: str, dim_column: str, normalized_column: str, version_column: str, model: str, space: str, dim: int, normalized: bool, version: str):
    cur.execute(f"ALTER TABLE {qident(table_name)} DROP CONSTRAINT {qident(constraint_name)}")
    cur.execute(
        build_constraint_sql(table_name, constraint_name, embedding_column, model_column, space_column, dim_column, normalized_column, version_column, [version]),
        (model, space, dim, normalized),
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source-key', required=True)
    ap.add_argument('--field-name', required=True)
    ap.add_argument('--constraint-name', required=True)
    ap.add_argument('--new-version', required=True)
    ap.add_argument('--runner', required=True, help='Command to execute re-embedding runner')
    ap.add_argument('--embedding-column', default=None)
    ap.add_argument('--model-column', default=None)
    ap.add_argument('--space-column', default=None)
    ap.add_argument('--dim-column', default=None)
    ap.add_argument('--normalized-column', default=None)
    ap.add_argument('--version-column', default=None)
    args = ap.parse_args()

    conn = psycopg2.connect(DB)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=RealDictCursor)

    contract = get_contract(cur, args.source_key, args.field_name)
    table_name = contract['table_name']
    old_version = contract['embedding_text_version']
    model = contract['embedding_model']
    space = contract['embedding_space']
    dim = contract['embedding_dim']
    normalized = contract['embedding_normalized']

    embedding_column = args.embedding_column or contract['embedding_column']
    base = embedding_column
    model_column = args.model_column or f'{base}_model'
    space_column = args.space_column or f'{base}_space'
    dim_column = args.dim_column or f'{base}_dim'
    normalized_column = args.normalized_column or f'{base}_normalized'
    version_column = args.version_column or f'{base}_text_version'

    print(f'Contract: {args.source_key}.{args.field_name} table={table_name} old_version={old_version} new_version={args.new_version}')
    print('Columns:', {
        'embedding_column': embedding_column,
        'model_column': model_column,
        'space_column': space_column,
        'dim_column': dim_column,
        'normalized_column': normalized_column,
        'version_column': version_column,
    })
    print('Initial version counts:', get_version_counts(cur, table_name, embedding_column, version_column))
    get_constraint(cur, table_name, args.constraint_name)

    if old_version != args.new_version:
        cur.execute(
            "UPDATE embedding_space_contracts SET embedding_text_version = %s, updated_at = NOW() WHERE id = %s",
            (args.new_version, contract['id']),
        )
        relax_constraint(cur, table_name, args.constraint_name, embedding_column, model_column, space_column, dim_column, normalized_column, version_column, model, space, dim, normalized, [old_version, args.new_version])
        conn.commit()
        print('Contract updated and constraint relaxed.')
    else:
        print('Contract already on target version; runner will still be executed.')

    result = subprocess.run(args.runner, shell=True)
    if result.returncode != 0:
        raise SystemExit(result.returncode)

    cur.execute(
        f"SELECT COUNT(*) FROM {qident(table_name)} WHERE {qident(embedding_column)} IS NOT NULL AND {qident(version_column)} <> %s",
        (args.new_version,),
    )
    remaining = cur.fetchone()['count']
    print('Remaining old-version embedded rows:', remaining)
    if remaining != 0:
        raise RuntimeError(f'Migration incomplete: {remaining} rows still not on {args.new_version}')

    tighten_constraint(cur, table_name, args.constraint_name, embedding_column, model_column, space_column, dim_column, normalized_column, version_column, model, space, dim, normalized, args.new_version)
    conn.commit()
    print('Constraint tightened to new version only.')
    print('Final version counts:', get_version_counts(cur, table_name, embedding_column, version_column))

    cur.close()
    conn.close()


if __name__ == '__main__':
    main()
