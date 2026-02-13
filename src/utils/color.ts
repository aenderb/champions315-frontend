/**
 * Retorna "white" ou "black" dependendo da luminância da cor de fundo.
 * Aceita hex (#rgb, #rrggbb) ou nomes CSS básicos.
 */
export function contrastColor(hex: string): string {
  // Remove # se presente
  let c = hex.replace("#", "");

  // Expande formato curto (#rgb → #rrggbb)
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // Luminância relativa (fórmula WCAG simplificada)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
