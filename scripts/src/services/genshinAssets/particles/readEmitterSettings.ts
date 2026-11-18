import type { EmitterSettings } from "#src/models/genshinAssets/particles/EmitterSettings";
import type { EmitterValue } from "#src/models/genshinAssets/particles/EmitterValue";
import type { ParticleSystemLayout } from "#src/models/genshinAssets/particles/ParticleSystemLayout";

import { CONSTANT_MODE, CURVE_REASON, NOT_HELD_REASON } from "#src/services/genshinAssets/particles/constants";

const WORD = 4;

// A constant's floats after its mode word, read by index, or the reason it is not one: a field the layout does not place,
// And a curve, which is named rather than read as its first float
const readConstant = <T>(
  bytes: Buffer,
  offset: number | undefined,
  toValue: (read: (index: number) => number) => T,
): EmitterValue<T> => {
  if (offset === undefined) return { kind: "notHeld", reason: NOT_HELD_REASON };
  if (bytes.readInt32LE(offset) !== CONSTANT_MODE) return { kind: "notHeld", reason: CURVE_REASON };
  return { kind: "read", value: toValue((index) => bytes.readFloatLE(offset + WORD + index * WORD)) };
};

// A particle system's settings read from its raw serialized bytes at the offsets the layout places each field, each of
// Which is named as not held when the layout does not place it
export const readEmitterSettings = (bytes: Buffer, layout: ParticleSystemLayout): EmitterSettings => ({
  colour: readConstant(bytes, layout.colour, (read): [number, number, number, number] => [
    read(0),
    read(1),
    read(2),
    read(3),
  ]),
  life: readConstant(bytes, layout.life, (read) => read(0)),
  rate: readConstant(bytes, layout.rate, (read) => read(0)),
  size: readConstant(bytes, layout.size, (read) => read(0)),
});
