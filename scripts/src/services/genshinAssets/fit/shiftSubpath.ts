import { NUMBER_REGEX } from "#src/services/genshinAssets/fit/constants";

export const shiftSubpath = (subpath: string, x: number, y: number): string => {
  let index = 0;
  return subpath.replaceAll(NUMBER_REGEX, (value) => String(Number(value) + (index++ % 2 === 0 ? x : y)));
};
