import { ClampToEdgeWrapping, DataTexture, LinearFilter, RGBAFormat, UnsignedByteType } from "three";

const BYTE = 255;
// A sky's gradient as its shader samples it: across, from the horizon at 0 to the top of its band at 1, the red the
// Share of the bottom colour over the top and the green the horizon halo's, each from evenly spaced samples, read
// Linearly between them. A sky with no gradient of its own falls from the bottom colour to the top in a smoothstep
// Over its band, with no halo
export const createSkyGradientTexture = ({
  green,
  red,
}: {
  green: readonly number[];
  red: readonly number[];
}): DataTexture => {
  const width = Math.max(red.length, green.length, 1);
  const data = new Uint8Array(width * 4);
  for (let index = 0; index < width; index++) {
    data[index * 4] = Math.round((red[index] ?? 0) * BYTE);
    data[index * 4 + 1] = Math.round((green[index] ?? 0) * BYTE);
    data[index * 4 + 3] = BYTE;
  }
  const texture = new DataTexture(data, width, 1, RGBAFormat, UnsignedByteType);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};
