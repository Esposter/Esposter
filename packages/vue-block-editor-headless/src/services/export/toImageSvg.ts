import type { ImageElement } from "#src/models/ImageElement";

import { escapeSvgValue } from "#src/services/export/escapeSvgValue";

// An image as the export draws it: a reference to its asset's url, never the file's bytes. It is an image to assistive technology, named by its alt text
// when it holds one, and nothing is drawn on the picture
export const toImageSvg = (
  { altText, fileId, height, width, x, y }: ImageElement,
  getAssetUrl: (fileId: string) => string,
): string => {
  const nameAttribute = altText ? ` aria-label="${escapeSvgValue(altText)}"` : "";
  return `<image x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" role="img"${nameAttribute} href="${escapeSvgValue(getAssetUrl(fileId))}"/>`;
};
