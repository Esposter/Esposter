import { checkIsTruthy } from "#src/services/shared/checkIsTruthy";

export const computeTruthyCount = (values: readonly number[]): number =>
  values.filter((value) => checkIsTruthy(value)).length;
