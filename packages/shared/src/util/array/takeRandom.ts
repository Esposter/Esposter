import { takeOne } from "#src/util/array/takeOne";

// An even draw from a list: the entry the random source's number lands on, so each one is as likely as another
export const takeRandom = <T>(values: readonly T[], random: () => number): T =>
  takeOne(values, Math.floor(random() * values.length));
