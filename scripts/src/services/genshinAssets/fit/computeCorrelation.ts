import { computeTextureMean } from "#src/services/genshinAssets/fit/computeTextureMean";

export const computeCorrelation = (first: Float64Array, second: Float64Array): number => {
  const [firstMean, secondMean] = [computeTextureMean(first), computeTextureMean(second)];
  let [product, firstSquare, secondSquare] = [0, 0, 0];
  for (const [index, value] of first.entries()) {
    const [firstOffset, secondOffset] = [value - firstMean, (second[index] ?? 0) - secondMean];
    product += firstOffset * secondOffset;
    firstSquare += firstOffset ** 2;
    secondSquare += secondOffset ** 2;
  }
  return product / Math.sqrt(firstSquare * secondSquare);
};
