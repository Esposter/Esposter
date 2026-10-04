import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import sharp from "sharp";

// An image's gradients by Sobel at the height given and the structure's width or the one given: along x and y, and
// Their magnitude, over its grey lightly blurred so a texel's noise does not read as an edge
export const readSobelGradients = async (
  input: Buffer,
  height: number,
  width: number = STRUCTURE_WIDTH,
): Promise<Record<"magnitudes" | "xGradients" | "yGradients", Float32Array>> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .greyscale()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const xGradients = new Float32Array(data.length);
  const yGradients = new Float32Array(data.length);
  const magnitudes = new Float32Array(data.length);
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < width - 1; x++) {
      const at = (dx: number, dy: number) => data[(y + dy) * width + x + dx] ?? 0;
      const index = y * width + x;
      const xGradient = at(1, -1) + 2 * at(1, 0) + at(1, 1) - at(-1, -1) - 2 * at(-1, 0) - at(-1, 1);
      const yGradient = at(-1, 1) + 2 * at(0, 1) + at(1, 1) - at(-1, -1) - 2 * at(0, -1) - at(1, -1);
      xGradients[index] = xGradient;
      yGradients[index] = yGradient;
      magnitudes[index] = Math.hypot(xGradient, yGradient);
    }
  return { magnitudes, xGradients, yGradients };
};
