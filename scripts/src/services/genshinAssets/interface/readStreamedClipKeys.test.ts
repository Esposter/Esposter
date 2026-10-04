import { evaluateStreamedCurve } from "#src/services/genshinAssets/interface/evaluateStreamedCurve";
import { readStreamedClipKeys } from "#src/services/genshinAssets/interface/readStreamedClipKeys";
import { describe, expect, test } from "vitest";

const toWord = (value: number): number => new Uint32Array(Float32Array.of(value).buffer)[0] ?? 0;

describe(readStreamedClipKeys, () => {
  test("reads each frame's keys by curve and evaluates a segment's cubic from its key's time", () => {
    expect.hasAssertions();

    // A frame at the lowest float with curve 0 constant at 1, then at 0.5 curve 0 rising linearly from 1 by 2 a second
    const words = [
      toWord(-3.4e38),
      1,
      0,
      toWord(0),
      toWord(0),
      toWord(0),
      toWord(1),
      toWord(0.5),
      1,
      0,
      toWord(0),
      toWord(0),
      toWord(2),
      toWord(1),
    ];
    const keys = readStreamedClipKeys(words).get(0) ?? [];

    expect(keys).toHaveLength(2);
    expect(evaluateStreamedCurve(keys, 0.25)).toBe(1);
    expect(evaluateStreamedCurve(keys, 1)).toBe(2);
  });
});
