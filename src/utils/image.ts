/**
 * Redimensiona e comprime uma imagem antes do upload.
 * Usa Canvas API para limitar resolução e tamanho de arquivo.
 */

const MAX_DIMENSION = 800; // px (largura ou altura máxima)
const QUALITY = 0.8; // qualidade JPEG (0–1)
const MAX_SIZE_BYTES = 500_000; // 500 KB

/**
 * Converte um File de imagem em um File comprimido (JPEG).
 * Ideal para fotos de celular que podem ter 5-15 MB.
 */
export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Se já é pequena o suficiente e não é HEIC, retorna direto
    if (file.size <= MAX_SIZE_BYTES && file.type.startsWith("image/jpeg")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensiona mantendo proporção
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Falha ao comprimir imagem"));
            return;
          }

          // Cria um novo File com o nome original mas extensão .jpg
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(compressed);
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem"));
    };

    img.src = url;
  });
}
