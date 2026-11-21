import type { DataTexture } from "three";

import { MAX_BYTE } from "#src/constants";

const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * MAX_BYTE);
// A cloud layer's texture's texels written in place, each one's four shares filled by `writeTexel` from its index into
// One scratch texel that is reused for every texel, the fields' rows from the first down written from its last up,
// Since a data texture's first row is the bottom one an image loader turns its first into, and the texture marked to
// Be uploaded again with its mipmaps
export const writeCloudLayerTexture = (
  texture: DataTexture,
  writeTexel: (index: number, texel: number[]) => void,
): void => {
  const { data, height, width } = texture.image;
  if (!data) return;
  const texel = [0, 0, 0, 0];
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      writeTexel(row * width + column, texel);
      const offset = ((height - 1 - row) * width + column) * 4;
      for (let channel = 0; channel < 4; channel++) data[offset + channel] = toByte(texel[channel] ?? 0);
    }
  texture.needsUpdate = true;
};
