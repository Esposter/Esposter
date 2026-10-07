import { splitSkyMask } from "#src/services/genshinParity/sky/splitSkyMask";
import { describe, expect, test } from "vitest";

describe(splitSkyMask, () => {
  const width = 4;

  test("deals every pixel of the sky to exactly one half, in blocks", () => {
    expect.hasAssertions();

    const sky = Uint8Array.from([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0]);
    const [first, second] = splitSkyMask(sky, width, 2);

    expect([...first]).toStrictEqual([1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect([...second]).toStrictEqual([0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0]);
  });

  test("shifts its blocks by the offset", () => {
    expect.hasAssertions();

    const [first] = splitSkyMask(new Uint8Array(width).fill(1), width, 2, 1);

    expect([...first]).toStrictEqual([1, 0, 0, 1]);
  });
});
