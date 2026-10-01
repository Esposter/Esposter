type Vector = readonly [number, number, number];
// How far a pixel's colour is blended toward the fog's at a depth: one less the light that crosses it
const readFogShare = (density: number, depth: number): number => 1 - Math.exp(-density * depth);
const DENSITY_STEPS = 60;
// The fog's colour and density that best haze a set of pixels from their lit colours by least squares: each pixel is
// Its lit colour blended toward the fog's by one less the light crossing its depth, which is linear in the fog's colour
// For one density, and no channel of it below zero; the density is searched over a span of decades, then narrowed by a golden section. Returns the fog
// And the root mean square residual
export const fitFog = (
  samples: readonly { color: Vector; depth: number; lit: Vector }[],
): { color: [number, number, number]; density: number; residual: number } => {
  const solveAt = (density: number): { color: [number, number, number]; residual: number } => {
    const color: [number, number, number] = [0, 0, 0];
    let squared = 0;
    for (const channel of [0, 1, 2] as const) {
      let ff = 0;
      let fr = 0;
      for (const { color: seen, depth, lit } of samples) {
        const share = readFogShare(density, depth);
        ff += share * share;
        fr += share * (seen[channel] - (1 - share) * lit[channel]);
      }
      color[channel] = ff > 0 ? Math.max(fr / ff, 0) : 0;
      for (const { color: seen, depth, lit } of samples) {
        const share = readFogShare(density, depth);
        squared += ((1 - share) * lit[channel] + share * (color[channel] ?? 0) - seen[channel]) ** 2;
      }
    }
    return { color, residual: Math.sqrt(squared / Math.max(samples.length * 3, 1)) };
  };
  // Densities from a millionth to one a metre, a tenth of a decade apart, then the bracket round the best narrowed
  const densities = Array.from({ length: DENSITY_STEPS + 1 }, (_, step) => 10 ** (-6 + (step * 6) / DENSITY_STEPS));
  let best = 0;
  for (const [index, density] of densities.entries())
    if (solveAt(density).residual < solveAt(densities[best] ?? 0).residual) best = index;
  let low = densities[Math.max(best - 1, 0)] ?? 0;
  let high = densities[Math.min(best + 1, DENSITY_STEPS)] ?? 1;
  const ratio = (Math.sqrt(5) - 1) / 2;
  for (let step = 0; step < 40; step++) {
    const first = high - ratio * (high - low);
    const second = low + ratio * (high - low);
    if (solveAt(first).residual < solveAt(second).residual) high = second;
    else low = first;
  }
  const density = (low + high) / 2;
  return { ...solveAt(density), density };
};
