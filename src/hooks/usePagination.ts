import { useState, useCallback } from 'react';

interface UsePaginationResult {
  page: number;
  perPage: number;
  offset: number;
  total: number;
  totalPages: number;
  setPage: (p: number) => void;
  setTotal: (t: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination(initialPerPage = 20): UsePaginationResult {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = initialPerPage;

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const offset = (page - 1) * perPage;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    page,
    perPage,
    offset,
    total,
    totalPages,
    setPage,
    setTotal,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
