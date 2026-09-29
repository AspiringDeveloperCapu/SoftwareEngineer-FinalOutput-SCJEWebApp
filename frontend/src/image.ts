// Turning a picked file into something the feed can store. Large photos are
// shrunk on a canvas first (the JSON record is the storage), while small
// PNG/WebP/GIF files are kept as-is so transparency and animation survive.
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const PASSTHROUGH_BYTES = 400 * 1024;
const MAX_EDGE = 1400;
const KEEP_FORMATS = ["image/png", "image/webp", "image/gif"];

const readDirectly = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

const downscale = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process that image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
};

export function fileToImageSrc(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Only image files can be used."));
  }
  if (file.size > MAX_FILE_BYTES) {
    return Promise.reject(new Error("That image is too large (max 15MB)."));
  }
  if (file.size <= PASSTHROUGH_BYTES && KEEP_FORMATS.includes(file.type)) {
    return readDirectly(file);
  }
  return downscale(file);
}

// The backend only accepts data URLs and http(s) links; this mirrors that
// check in the manage forms so bad values never get sent.
export const isImageUrl = (value: string) =>
  value.startsWith("data:image/") || /^https?:\/\/\S+$/i.test(value);
