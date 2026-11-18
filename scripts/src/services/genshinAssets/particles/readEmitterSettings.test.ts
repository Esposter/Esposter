import { CURVE_REASON, NOT_HELD_REASON } from "#src/services/genshinAssets/particles/constants";
import { readEmitterSettings } from "#src/services/genshinAssets/particles/readEmitterSettings";
import { describe, expect, test } from "vitest";

// A field as its bytes hold it when it is a constant: its mode word, then each of its floats a word after the last
const writeConstant = (mode: number, ...floats: number[]): Buffer => {
  const bytes = Buffer.alloc((1 + floats.length) * 4);
  bytes.writeInt32LE(mode, 0);
  for (const [index, float] of floats.entries()) bytes.writeFloatLE(float, (index + 1) * 4);
  return bytes;
};

describe(readEmitterSettings, () => {
  test("an emitter's rate and life are read from its raw bytes", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([writeConstant(0, 0), writeConstant(0, -1)]);

    expect(readEmitterSettings(bytes, { life: 8, rate: 0 })).toStrictEqual({
      colour: { kind: "notHeld", reason: NOT_HELD_REASON },
      life: { kind: "read", value: -1 },
      rate: { kind: "read", value: 0 },
      size: { kind: "notHeld", reason: NOT_HELD_REASON },
    });
  });

  test("a field the export does not hold, or holds as a curve, is named rather than guessed", () => {
    expect.hasAssertions();

    expect(readEmitterSettings(writeConstant(1, 0), { rate: 0 })).toStrictEqual({
      colour: { kind: "notHeld", reason: NOT_HELD_REASON },
      life: { kind: "notHeld", reason: NOT_HELD_REASON },
      rate: { kind: "notHeld", reason: CURVE_REASON },
      size: { kind: "notHeld", reason: NOT_HELD_REASON },
    });
  });

  test("an emitter's colour is read as its constant colour", () => {
    expect.hasAssertions();

    expect(readEmitterSettings(writeConstant(0, 0, -1, 0, -1), { colour: 0 }).colour).toStrictEqual({
      kind: "read",
      value: [0, -1, 0, -1],
    });
  });
});
