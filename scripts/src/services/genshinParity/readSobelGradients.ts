import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import sharp from "sharp";

// An image's gradients by Sobel at the structure's width and the height given: along x and y, and their magnitude,
// Over its grey lightly blurred so a texel's noise does not read as an edge
export const readSobelGradients = async (
  input: Buffer,
  height: number,
): Promise<Record<"magnitudes" | "xGradients" | "yGradients", Float32Array>> => {
  const { data } = await sharp(input)
    .resize(STRUCTURE_WIDTH, height, { fit: "fill" })
    .greyscale()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const xGradients = new Float32Array(data.length);
  const yGradients = new Float32Array(data.length);
  const magnitudes = new Float32Array(data.length);
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < STRUCTURE_WIDTH - 1; x++) {
      const at = (dx: number, dy: number) => data[(y + dy) * STRUCTURE_WIDTH + x + dx] ?? 0;
      const index = y * STRUCTURE_WIDTH + x;
      const xGradient = at(1, -1) + 2 * at(1, 0) + at(1, 1) - at(-1, -1) - 2 * at(-1, 0) - at(-1, 1);
      const yGradient = at(-1, 1) + 2 * at(0, 1) + at(1, 1) - at(-1, -1) - 2 * at(0, -1) - at(1, -1);
      xGradients[index] = xGradient;
      yGradients[index] = yGradient;
      magnitudes[index] = Math.hypot(xGradient, yGradient);
    }
  return { magnitudes, xGradients, yGradients };
};
