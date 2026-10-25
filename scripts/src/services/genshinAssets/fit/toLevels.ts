export const toLevels = (frames: number[][], bandGains: number[]): number[][] =>
  frames.map((bands) => bands.map((power, band) => Math.sqrt(power * (bandGains[band] ?? 1))));
