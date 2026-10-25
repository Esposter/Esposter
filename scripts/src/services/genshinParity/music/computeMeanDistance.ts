export const computeMeanDistance = (gaps: number[]): number =>
  gaps.reduce((sum, gap) => sum + Math.abs(gap), 0) / Math.max(gaps.length, 1);
