import type { SobelGradients } from "#src/models/genshinParity/shared/SobelGradients";

import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import sharp from "sharp";

// An image's gradients by Sobel at the height given and the structure's width or the one given: along x and y, and
// Their magnitude, over its grey lightly blurred so a texel's noise does not read as an edge
export const readSobelGradients = async (
  input: Buffer,
  height: number,
  width: number = STRUCTURE_WIDTH,
): Promise<SobelGradients> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .greyscale()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const xGradients = new Float32Array(data.length);
  const yGradients = new Float32Array(data.length);
  const magnitudes = new Float32Array(data.length);
  const at = (index: number, offsetX: number, offsetY: number): number => data[index + offsetY * width + offsetX] ?? 0;
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      const xGradient =
        at(index, 1, -1) +
        2 * at(index, 1, 0) +
        at(index, 1, 1) -
        at(index, -1, -1) -
        2 * at(index, -1, 0) -
        at(index, -1, 1);
      const yGradient =
        at(index, -1, 1) +
        2 * at(index, 0, 1) +
        at(index, 1, 1) -
        at(index, -1, -1) -
        2 * at(index, 0, -1) -
        at(index, 1, -1);
      xGradients[index] = xGradient;
      yGradients[index] = yGradient;
      magnitudes[index] = Math.hypot(xGradient, yGradient);
    }
  return { magnitudes, xGradients, yGradients };
};
