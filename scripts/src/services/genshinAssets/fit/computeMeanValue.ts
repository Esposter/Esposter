import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

export const computeMeanValue = (values: readonly number[]): number =>
  roundFitted(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
