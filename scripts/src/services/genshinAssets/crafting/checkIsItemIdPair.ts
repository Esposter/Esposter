// A pair of item ids under one of an offer row's keys, which the offer's per-slot lists are, read by shape
export const checkIsItemIdPair = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === "number");
