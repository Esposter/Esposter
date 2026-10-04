import { readEdgeThreshold } from "#src/services/genshinParity/shared/readEdgeThreshold";
import { readSobelGradients } from "#src/services/genshinParity/shared/readSobelGradients";

// An image's edges at the height given and the structure's width or the one given, as a mask of its pixels
export const readStructureEdges = async (input: Buffer, height: number, width?: number): Promise<Uint8Array> => {
  const { magnitudes } = await readSobelGradients(input, height, width);
  const threshold = readEdgeThreshold(magnitudes);
  return Uint8Array.from(magnitudes, (magnitude) => (magnitude >= threshold ? 1 : 0));
};
