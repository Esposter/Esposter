import type { Effect } from "#shared/models/clicker/data/effect/Effect";

export const applyMultiplicativeEffects = (basePower: number, multiplicativeEffects: Effect[]) =>
  multiplicativeEffects.reduce((resultPower, { value }) => resultPower * value, basePower);
