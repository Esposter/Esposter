import { estimateEdgeSigma } from "#src/services/genshinParity/reference/estimateEdgeSigma";

// The samples either side of an edge's peak, so its whole rise and fall lie inside the profile read across it
const PROFILE_RADIUS = 6;
// The least rise an interface edge has: text strokes and panel borders against their ground, not the scene's shading
const MIN_CONTRAST = 128;

// The sigma of each edge along one row or column: every peak of its gradient with a profile around it and a rise big
// Enough to read
export const readLineSigmas = (line: Float64Array, sigmas: number[]): void => {
  for (let index = PROFILE_RADIUS; index < line.length - PROFILE_RADIUS; index++) {
    const gradient = Math.abs((line[index + 1] ?? 0) - (line[index - 1] ?? 0));
    const previousGradient = Math.abs((line[index] ?? 0) - (line[index - 2] ?? 0));
    const nextGradient = Math.abs((line[index + 2] ?? 0) - (line[index] ?? 0));
    if (gradient === 0 || gradient <= previousGradient || gradient < nextGradient) continue;
    const profile = [...line.subarray(index - PROFILE_RADIUS, index + PROFILE_RADIUS + 1)];
    if (Math.max(...profile) - Math.min(...profile) < MIN_CONTRAST) continue;
    const sigma = estimateEdgeSigma(profile);
    if (sigma !== undefined) sigmas.push(sigma);
  }
};
