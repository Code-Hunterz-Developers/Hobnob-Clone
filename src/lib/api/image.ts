// Firebase Storage requires a paid (Blaze) plan, so images are compressed
// client-side and stored inline as base64 data URLs on the Firestore doc
// itself. Firestore caps documents at 1MB, so we keep images small.
const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.75;
const MAX_DATA_URL_LENGTH = 900_000;

export async function processImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Image is too large even after compression — please use a smaller photo.');
  }

  return dataUrl;
}
