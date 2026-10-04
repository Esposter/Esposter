import type { SkyGradient } from "#src/atmosphere/SkyGradient";

import { MAX_BYTE } from "#src/constants";
import { ClampToEdgeWrapping, DataTexture, LinearFilter, RGBAFormat, UnsignedByteType } from "three";

// A sky's gradient as the texture its shader samples, read linearly between its samples. A sky with no gradient of its own falls from the bottom colour to the top in a smoothstep
// Over its band, with no halo
export const createSkyGradientTexture = ({ green, red }: SkyGradient): DataTexture => {
  const width = Math.max(red.length, green.length, 1);
  const data = new Uint8Array(width * 4);
  for (let index = 0; index < width; index++) {
    data[index * 4] = Math.round((red[index] ?? 0) * MAX_BYTE);
    data[index * 4 + 1] = Math.round((green[index] ?? 0) * MAX_BYTE);
    data[index * 4 + 3] = MAX_BYTE;
  }
  const texture = new DataTexture(data, width, 1, RGBAFormat, UnsignedByteType);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};
