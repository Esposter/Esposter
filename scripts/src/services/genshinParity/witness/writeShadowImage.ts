import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The reference beside its edges, written as a PNG under the parity directory: the reference's edges in green, the
// Scene's shipped ones in red and the solved direction's in blue. Returns the file's path
export const writeShadowImage = async ({
  height,
  referenceEdges,
  referenceId,
  shippedEdges,
  shot,
  solvedEdges,
  width,
}: {
  height: number;
  referenceEdges: Uint8Array;
  referenceId: string;
  shippedEdges: Uint8Array;
  shot: Buffer;
  solvedEdges?: Uint8Array | undefined;
  width: number;
}): Promise<string> => {
  const marked = Buffer.from(shot);
  for (const [edges, color] of [
    [referenceEdges, [0, BYTE, 0]],
    [shippedEdges, [BYTE, 0, 0]],
    [solvedEdges ?? new Uint8Array(), [0, 0, BYTE]],
  ] as const)
    for (const [pixel, isSet] of edges.entries()) if (isSet) marked.set(color, pixel * 3);
  const directory = join(PARITY_DIRECTORY, "shadows");
  await mkdir(directory, { recursive: true });
  const imagePath = join(directory, `${referenceId}.png`);
  await sharp(marked, { raw: { channels: 3, height, width } })
    .png()
    .toFile(imagePath);
  return imagePath;
};
