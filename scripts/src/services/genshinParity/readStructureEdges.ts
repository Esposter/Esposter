import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import sharp from "sharp";

// An edge is the strongest tenth of an image's gradients, so a darker or softer image still has as many, and never a
// Gradient weaker than a faint line's, so a frame of flat sky has no edges rather than a tenth of its noise
const EDGE_SHARE = 0.1;
const EDGE_MAGNITUDE_FLOOR = 24;
// An image's strongest gradients by Sobel at the structure's width and the height given, as a mask of its pixels
export const readStructureEdges = async (input: Buffer, height: number): Promise<Uint8Array> => {
  const { data } = await sharp(input)
    .resize(STRUCTURE_WIDTH, height, { fit: "fill" })
    .greyscale()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const magnitudes = new Float32Array(data.length);
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < STRUCTURE_WIDTH - 1; x++) {
      const at = (dx: number, dy: number) => data[(y + dy) * STRUCTURE_WIDTH + x + dx] ?? 0;
      const gx = at(1, -1) + 2 * at(1, 0) + at(1, 1) - at(-1, -1) - 2 * at(-1, 0) - at(-1, 1);
      const gy = at(-1, 1) + 2 * at(0, 1) + at(1, 1) - at(-1, -1) - 2 * at(0, -1) - at(1, -1);
      magnitudes[y * STRUCTURE_WIDTH + x] = Math.hypot(gx, gy);
    }
  const sorted = magnitudes.toSorted();
  const threshold = Math.max(sorted[Math.floor(sorted.length * (1 - EDGE_SHARE))] ?? 0, EDGE_MAGNITUDE_FLOOR);
  return Uint8Array.from(magnitudes, (magnitude) => (magnitude >= threshold ? 1 : 0));
};
