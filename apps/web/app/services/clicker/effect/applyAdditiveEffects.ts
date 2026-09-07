import type { Effect } from "#shared/models/clicker/data/effect/Effect";

export const applyAdditiveEffects = (basePower: number, additiveEffects: Effect[]) =>
  additiveEffects.reduce((resultPower, { value }) => resultPower + value, basePower);
