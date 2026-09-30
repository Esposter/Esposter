import { SerializedFieldKind } from "#src/models/genshinAssets/SerializedFieldKind";
import { scanSerializedFields } from "#src/services/genshinAssets/scanSerializedFields";
import { describe, expect, test } from "vitest";

const writeInts = (...values: number[]): Buffer => Buffer.from(new Int32Array(values).buffer);
const writeFloats = (...values: number[]): Buffer => Buffer.from(new Float32Array(values).buffer);
const writePointer = (fileIndex: number, pathId: bigint): Buffer => {
  const bytes = Buffer.alloc(12);
  bytes.writeInt32LE(fileIndex);
  bytes.writeBigInt64LE(pathId, 4);
  return bytes;
};
const checkIsPointer = ({ pathId }: { pathId: string }): boolean => pathId === "-1";

describe(scanSerializedFields, () => {
  // A MonoBehaviour's header: its game object, its enabled flag, its script and an empty name
  const header = Buffer.concat([writePointer(0, 1n), writeInts(1), writePointer(0, 1n), writeInts(0)]);

  test("reads a pointer the data holds, a curve, an array, a gradient, a colour and scalars in their order", () => {
    expect.hasAssertions();

    const gradientTimes = Buffer.alloc(32);
    gradientTimes.writeUInt16LE(65_535, 2);
    gradientTimes.writeUInt16LE(65_535, 18);
    const gradientCounts = Buffer.from([2, 2, 0, 0]);
    const bytes = Buffer.concat([
      header,
      writePointer(1, -1n),
      // One key at time 0, value 1, flat, unweighted, then its wrap modes and rotation order
      writeInts(1),
      writeFloats(0, 1, 0, 0),
      writeInts(0),
      writeFloats(0, 0),
      writeInts(0, 0, 0),
      // Two pointers
      writeInts(2),
      writePointer(0, -1n),
      writePointer(0, -1n),
      // Two keys of eight in use, black to white
      writeFloats(0, 0, 0, 1, 1, 1, 1, 1),
      Buffer.alloc(6 * 16),
      gradientTimes,
      writeInts(0),
      gradientCounts,
      writeFloats(0.5, 0, 0, 1),
      writeInts(-1),
      writeFloats(0.5),
    ]);

    expect(scanSerializedFields(bytes, checkIsPointer).map(({ kind, offset }) => ({ kind, offset }))).toStrictEqual([
      { kind: SerializedFieldKind.Pointer, offset: 32 },
      { kind: SerializedFieldKind.Curve, offset: 44 },
      { kind: SerializedFieldKind.Array, offset: 88 },
      { kind: SerializedFieldKind.Gradient, offset: 116 },
      { kind: SerializedFieldKind.Color, offset: 284 },
      { kind: SerializedFieldKind.Integer, offset: 300 },
      { kind: SerializedFieldKind.Float, offset: 304 },
    ]);
  });

  test("reads a curve whose keyframes are four words, as this game writes them", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([header, writeInts(2), writeFloats(0, 1, 0, 0, 1, 0, 0, 0), writeInts(2, 2, 0)]);

    expect(scanSerializedFields(bytes, checkIsPointer)).toStrictEqual([
      {
        keys: [
          { inSlope: 0, outSlope: 0, time: 0, value: 1 },
          { inSlope: 0, outSlope: 0, time: 1, value: 0 },
        ],
        kind: SerializedFieldKind.Curve,
        offset: 32,
      },
    ]);
  });

  test("reads a gradient's keys at their times", () => {
    expect.hasAssertions();

    const times = Buffer.alloc(32);
    times.writeUInt16LE(65_535, 2);
    times.writeUInt16LE(65_535, 18);
    const bytes = Buffer.concat([
      header,
      writeFloats(0, 0, 0, 1, 1, 1, 1, 0),
      Buffer.alloc(6 * 16),
      times,
      writeInts(0),
      Buffer.from([2, 2, 0, 0]),
    ]);

    expect(scanSerializedFields(bytes, checkIsPointer)).toStrictEqual([
      {
        alphaKeys: [
          { alpha: 1, time: 0 },
          { alpha: 0, time: 1 },
        ],
        colorKeys: [
          { color: [0, 0, 0], time: 0 },
          { color: [1, 1, 1], time: 1 },
        ],
        kind: SerializedFieldKind.Gradient,
        offset: 32,
      },
    ]);
  });
});
