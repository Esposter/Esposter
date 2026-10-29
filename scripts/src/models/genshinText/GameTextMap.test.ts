import { GameTextMap } from "#src/models/genshinText/GameTextMap";
import { describe, expect, test } from "vitest";

describe(GameTextMap, () => {
  const HASH = "1";
  const VARIANT_HASH = "513";
  const TEXT = "a";
  const VARIANT_TEXT = "b";

  test("answers a hash by its own entry", () => {
    expect.hasAssertions();

    const textMap = new GameTextMap([[HASH, TEXT]]);

    expect(textMap.get(HASH)).toBe(TEXT);
    expect(textMap.has(HASH)).toBe(true);
  });

  test("answers a hash its text map files one bit away by that entry, in either direction", () => {
    expect.hasAssertions();

    const textMap = new GameTextMap([[VARIANT_HASH, VARIANT_TEXT]]);

    expect(textMap.get(HASH)).toBe(VARIANT_TEXT);
    expect(textMap.has(HASH)).toBe(true);
    expect(new GameTextMap([[HASH, TEXT]]).get(VARIANT_HASH)).toBe(TEXT);
  });

  test("answers a hash by its own entry before its variant's", () => {
    expect.hasAssertions();

    expect(
      new GameTextMap([
        [HASH, TEXT],
        [VARIANT_HASH, VARIANT_TEXT],
      ]).get(HASH),
    ).toBe(TEXT);
  });

  test("answers a hash neither entry holds, and an id that is no hash, by nothing", () => {
    expect.hasAssertions();

    const textMap = new GameTextMap([[VARIANT_HASH, VARIANT_TEXT]]);

    expect(textMap.get("2")).toBeUndefined();
    expect(textMap.has("a")).toBe(false);
  });

  test("lists only its own entries", () => {
    expect.hasAssertions();

    expect(new GameTextMap([[HASH, TEXT]]).size).toBe(1);
  });
});
