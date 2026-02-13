/**
 * Plugin Vite que transforma o CSS final do bundle para
 * ser compatível com navegadores antigos (ex: Chrome 92).
 *
 * Usa Lightning CSS para:
 * - Converter oklch()/lab()/lch() para rgb (Chrome 111+)
 * - Converter color-mix() para cores estáticas (Chrome 111+)
 *
 * E manualmente:
 * - Remove @layer wrappers (Chrome 99+) mantendo o conteúdo na ordem original
 * - Remove @property declarações (Chrome 85+ mas pode ter bugs em versões antigas)
 * - Remove unidade lh (Chrome 109+)
 * - Remove color-mix() residual dentro de @supports (desnecessário, hex fallback existe)
 */

import { transform, browserslistToTargets } from "lightningcss";
import browserslist from "browserslist";
import type { Plugin } from "vite";

/**
 * Remove wrappers de @layer mantendo o conteúdo interno
 * na mesma ordem (preserva a cascata que o Tailwind estabeleceu).
 */
function stripLayerWrappers(css: string): string {
  // Remove declarações vazias: @layer name;
  css = css.replace(/@layer\s+[\w-]+\s*;/g, "");

  // Unwrap blocos @layer name { ... }
  let result = "";
  let i = 0;

  while (i < css.length) {
    if (css.substring(i, i + 6) === "@layer") {
      let j = i + 6;
      // Avança até { ou ;
      while (j < css.length && css[j] !== "{" && css[j] !== ";") j++;

      if (j >= css.length) {
        result += css.substring(i);
        break;
      }

      if (css[j] === ";") {
        i = j + 1;
        continue;
      }

      // css[j] === '{' → bloco de layer
      j++;
      let depth = 1;
      const start = j;
      while (j < css.length && depth > 0) {
        if (css[j] === "{") depth++;
        if (css[j] === "}") depth--;
        j++;
      }
      result += css.substring(start, j - 1);
      i = j;
      continue;
    }

    result += css[i];
    i++;
  }

  return result;
}

/**
 * Remove blocos @property (registrar custom properties é opcional;
 * o @supports block no Tailwind já inicializa os valores em * {}).
 */
function stripAtProperty(css: string): string {
  return css.replace(/@property\s+--[\w-]+\s*\{[^}]*\}/g, "");
}

/**
 * Remove blocos @supports que contêm color-mix, color(), lab()
 * (Chrome 92 não suporta, já temos hex fallback fora do @supports).
 */
function stripUnsupportedSupports(css: string): string {
  let result = "";
  let i = 0;

  while (i < css.length) {
    if (css.substring(i, i + 9) === "@supports") {
      // Captura a condição até o {
      let j = i + 9;
      while (j < css.length && css[j] !== "{") j++;

      const condition = css.substring(i + 9, j);

      // Se a condição contém color-mix, color(display-p3, lab(), lh — remover bloco inteiro
      if (
        condition.includes("color-mix") ||
        condition.includes("color(display-p3") ||
        condition.includes("lab(") ||
        condition.includes("contain-intrinsic-size")
      ) {
        // Pular o bloco inteiro
        j++; // pula {
        let depth = 1;
        while (j < css.length && depth > 0) {
          if (css[j] === "{") depth++;
          if (css[j] === "}") depth--;
          j++;
        }
        i = j;
        continue;
      }

      // @supports que Chrome 92 suporta → manter
      result += css.substring(i, j + 1);
      i = j + 1;
      continue;
    }

    result += css[i];
    i++;
  }

  return result;
}

/**
 * Remove a unidade `lh` que Chrome 109+ suporta.
 */
function stripLhUnit(css: string): string {
  return css.replace(/:\s*1lh\s*;/g, ": 1.5em;");
}

export function cssCompatPlugin(query = "chrome >= 92"): Plugin {
  const targets = browserslistToTargets(browserslist(query));

  return {
    name: "css-compat-downlevel",
    enforce: "post",
    generateBundle(_, bundle) {
      for (const key in bundle) {
        const chunk = bundle[key];
        if (chunk.type === "asset" && key.endsWith(".css")) {
          try {
            // 1) Lightning CSS: converte oklch, color-mix em hex/rgb
            const { code } = transform({
              filename: key,
              code: Buffer.from(chunk.source as string),
              targets,
            });

            let css = code.toString();

            // 2) Remove @layer wrappers
            css = stripLayerWrappers(css);

            // 3) Remove @property (desnecessário, * {} já inicializa tudo)
            css = stripAtProperty(css);

            // 4) Remove @supports com features não suportadas
            css = stripUnsupportedSupports(css);

            // 5) Substitui unidade lh
            css = stripLhUnit(css);

            // 6) Remove linhas em branco extras
            css = css.replace(/\n{3,}/g, "\n\n");

            chunk.source = css;
          } catch (err) {
            console.warn(`[css-compat] Falha ao transformar ${key}:`, err);
          }
        }
      }
    },
  };
}
