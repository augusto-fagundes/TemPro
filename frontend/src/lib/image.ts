const LOGO_MAX_EDGE = 512;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível ler a imagem"));
    img.src = src;
  });
}

/**
 * Turns a picked image file into a data URL sized for avatar/logo use.
 * Keeps PNG when the source has transparency; otherwise JPEG.
 */
export async function fileToDataUrl(
  file: File,
  maxEdge = LOGO_MAX_EDGE,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível processar a imagem");
    ctx.drawImage(img, 0, 0, width, height);

    const keepAlpha =
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "image/gif";
    return keepAlpha
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
