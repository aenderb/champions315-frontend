export function FieldMarkings() {
  return (
    <>
      {/* Portrait markings (mobile/tablet portrait only) */}
      <svg
        className="absolute inset-0 w-full h-full landscape:hidden lg:hidden"
        viewBox="0 0 300 360"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Linhas externas (4 lados) */}
        <line x1="5" y1="5" x2="295" y2="5" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="5" y1="355" x2="295" y2="355" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="5" y1="5" x2="5" y2="355" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="295" y1="5" x2="295" y2="355" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

        {/* Linha central */}
        <line x1="5" y1="180" x2="295" y2="180" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

        {/* Círculo central */}
        <ellipse cx="150" cy="180" rx="40" ry="45" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="150" cy="180" r="3" fill="white" fillOpacity="0.4" />

        {/* Área de pênalti INFERIOR (gol do time) */}
        <rect x="65" y="280" width="170" height="75" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <rect x="100" y="325" width="100" height="30" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="150" cy="305" r="3" fill="white" fillOpacity="0.4" />
        <path d="M 105 280 Q 150 258 195 280" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        {/* Área de pênalti SUPERIOR (gol adversário) */}
        <rect x="65" y="5" width="170" height="75" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <rect x="100" y="5" width="100" height="30" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="150" cy="55" r="3" fill="white" fillOpacity="0.4" />
        <path d="M 105 80 Q 150 102 195 80" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        {/* Corner arcs - 4 cantos */}
        <path d="M 5 15 Q 5 5 15 5" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 285 5 Q 295 5 295 15" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 5 345 Q 5 355 15 355" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 285 355 Q 295 355 295 345" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      </svg>

      {/* Landscape markings (landscape mobile/tablet + desktop) */}
      <svg
        className="absolute inset-0 w-full h-full hidden landscape:block lg:block"
        viewBox="0 0 700 300"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Linhas externas (4 lados) */}
        <line x1="5" y1="5" x2="695" y2="5" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="5" y1="295" x2="695" y2="295" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="5" y1="5" x2="5" y2="295" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <line x1="695" y1="5" x2="695" y2="295" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

        {/* Linha central */}
        <line x1="350" y1="5" x2="350" y2="295" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

        {/* Círculo central */}
        <ellipse cx="350" cy="150" rx="55" ry="40" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="350" cy="150" r="3" fill="white" fillOpacity="0.4" />

        {/* Área de pênalti ESQUERDA (gol do time) */}
        <rect x="5" y="55" width="110" height="190" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <rect x="5" y="95" width="45" height="110" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="85" cy="150" r="3" fill="white" fillOpacity="0.4" />
        <path d="M 115 100 Q 145 150 115 200" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        {/* Área de pênalti DIREITA (gol adversário) */}
        <rect x="585" y="55" width="110" height="190" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <rect x="650" y="95" width="45" height="110" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="615" cy="150" r="3" fill="white" fillOpacity="0.4" />
        <path d="M 585 100 Q 555 150 585 200" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        {/* Corner arcs - todos os 4 cantos */}
        <path d="M 15 5 Q 5 5 5 15" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 5 285 Q 5 295 15 295" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 685 5 Q 695 5 695 15" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M 695 285 Q 695 295 685 295" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      </svg>
    </>
  );
}
