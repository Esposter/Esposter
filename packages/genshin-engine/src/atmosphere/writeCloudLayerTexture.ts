import type { DataTexture } from "three";

import { MAX_BYTE } from "#src/constants";

const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * MAX_BYTE);
// A cloud layer's texture's texels written in place, each read from its fields by its index, the fields' rows from the
// First down written from its last up, since a data texture's first row is the bottom one an image loader turns its
// First into, and the texture marked to be uploaded again with its mipmaps
export const writeCloudLayerTexture = (texture: DataTexture, readTexel: (index: number) => readonly number[]): void => {
  const { data, height, width } = texture.image;
  if (!data) return;
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++)
      data.set(
        readTexel(row * width + column).map((share) => toByte(share)),
        ((height - 1 - row) * width + column) * 4,
      );
  texture.needsUpdate = true;
};
