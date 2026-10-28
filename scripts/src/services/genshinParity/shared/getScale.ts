import { NUMBER_SOURCE } from "#src/services/genshinParity/shared/constants";
import { countDecimals } from "#src/services/genshinParity/shared/countDecimals";

const NUMBERS_REGEX = new RegExp(NUMBER_SOURCE, "gu");

// The path's own precision, the most decimals any of its numbers needs, so every coordinate is an exact integer
export const getScale = (d: string): number => {
  let decimals = 0;
  for (const [numberText] of d.matchAll(NUMBERS_REGEX)) decimals = Math.max(decimals, countDecimals(numberText));
  return 10 ** decimals;
};
