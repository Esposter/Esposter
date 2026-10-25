export const formatLab = ([lightness = 0, a = 0, b = 0]: readonly number[]): string =>
  `L ${lightness.toFixed(1)} a ${a.toFixed(1)} b ${b.toFixed(1)}`;
