import { THUMBNAIL_MAX_EDGE } from "@/services/file/constants";
import { getMimeCategory, MimeCategory, THUMBNAIL_CONTENT_TYPE } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Downscales an image to a thumbnail whose longest edge is THUMBNAIL_MAX_EDGE; undefined for non-images or on failure.
export const generateImageThumbnail = (file: File): Promise<Blob | undefined> => {
  if (getMimeCategory(file.type) !== MimeCategory.Image) return Promise.resolve(undefined);

  return getResultAsync(async () => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return undefined;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return canvas.convertToBlob({ quality: 0.8, type: THUMBNAIL_CONTENT_TYPE });
  }).unwrapOr(undefined);
};
