import { readEdgeThreshold } from "#src/services/genshinParity/readEdgeThreshold";
import { readSobelGradients } from "#src/services/genshinParity/readSobelGradients";

// An image's edges at the structure's width and the height given, as a mask of its pixels
export const readStructureEdges = async (input: Buffer, height: number): Promise<Uint8Array> => {
  const { magnitudes } = await readSobelGradients(input, height);
  const threshold = readEdgeThreshold(magnitudes);
  return Uint8Array.from(magnitudes, (magnitude) => (magnitude >= threshold ? 1 : 0));
};
