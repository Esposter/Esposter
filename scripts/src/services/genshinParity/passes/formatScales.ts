// A family's structure at each scale, finest first, to three places
export const formatScales = (scales: readonly number[]): string => scales.map((scale) => scale.toFixed(3)).join(" ");
