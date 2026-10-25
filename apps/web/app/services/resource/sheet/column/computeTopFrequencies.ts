import { MAX_TOP_FREQUENCIES } from "@/services/resource/sheet/column/constants";

export const computeTopFrequencies = (countMap: ReadonlyMap<string, number>): readonly (readonly [string, number])[] =>
  [...countMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, MAX_TOP_FREQUENCIES);
