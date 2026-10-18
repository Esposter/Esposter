import { computeSum } from "#src/services/function/computeSum";

export const computeMean = (values: readonly number[]): number => computeSum(values) / values.length;
