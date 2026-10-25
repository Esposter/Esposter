import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeMean } from "#src/services/recreation/statistics/computeMean";

export const computeMeanValue = (values: readonly number[]): number => roundFitted(computeMean(values));
