import type { EmitterValue } from "#src/models/genshinAssets/particles/EmitterValue";

import { CONSTANT_MODE, CURVE_REASON, NOT_HELD_REASON } from "#src/services/genshinAssets/particles/constants";

// The width of a float in bytes, which a constant's floats are read by after its mode word
const WORD = 4;

// A constant's floats after its mode word, read by index, or the reason it is not one: a field the layout does not place,
// And a curve, which is named rather than read as its first float
export const readEmitterConstant = <T>(
  bytes: Buffer,
  offset: number | undefined,
  toValue: (read: (index: number) => number) => T,
): EmitterValue<T> => {
  if (offset === undefined) return { kind: "notHeld", reason: NOT_HELD_REASON };
  if (bytes.readInt32LE(offset) !== CONSTANT_MODE) return { kind: "notHeld", reason: CURVE_REASON };
  return { kind: "read", value: toValue((index) => bytes.readFloatLE(offset + WORD + index * WORD)) };
};
