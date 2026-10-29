// The mean of a cell's three channel sums over its pixels, rounded to whole channels
export const toMeanColour = (sums: readonly number[], count: number): [number, number, number] => {
  const denominator = Math.max(count, 1);
  const [red = 0, green = 0, blue = 0] = sums;
  return [Math.round(red / denominator), Math.round(green / denominator), Math.round(blue / denominator)];
};
