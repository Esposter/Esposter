import type { ImageElement } from "#src/models/ImageElement";

import { escapeSvgValue } from "#src/services/export/escapeSvgValue";

// An image as the export draws it: a reference to its asset's url, never the file's bytes
export const toImageSvg = (
  { fileId, height, width, x, y }: ImageElement,
  getAssetUrl: (fileId: string) => string,
): string =>
  `<image x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" href="${escapeSvgValue(getAssetUrl(fileId))}"/>`;
