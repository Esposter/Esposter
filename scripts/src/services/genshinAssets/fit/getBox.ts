import { NUMBER_REGEX } from "#src/services/genshinAssets/fit/constants";

export const getBox = (subpath: string): { bottom: number; left: number; right: number; top: number } => {
  const numbers = Array.from(subpath.matchAll(NUMBER_REGEX), ([value]) => Number(value));
  const xs = numbers.filter((_value, index) => index % 2 === 0);
  const ys = numbers.filter((_value, index) => index % 2 === 1);
  return { bottom: Math.max(...ys), left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys) };
};
