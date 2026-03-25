export function AlexandriaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ALEXANDRIA text */}
      <text
        x="0"
        y="85"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        letterSpacing="8"
        fill="#053827"
      >
        ALEXANDRIA
      </text>
      {/* Grid accent mark */}
      <g transform="translate(720, 20)" opacity="0.6">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 14}
              y={row * 14}
              width="10"
              height="10"
              rx="1.5"
              fill="#053827"
              opacity={(row + col) % 3 === 0 ? 0.9 : 0.35}
            />
          ))
        )}
      </g>
    </svg>
  );
}
