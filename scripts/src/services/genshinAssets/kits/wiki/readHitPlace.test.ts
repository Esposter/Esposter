import { readHitPlace } from "#src/services/genshinAssets/kits/wiki/readHitPlace";
import { describe, expect, test } from "vitest";

describe(readHitPlace, () => {
  test("reads a title's trailing whole number as its place, `4-Hit DMG 2` as 2", () => {
    expect.hasAssertions();

    expect(readHitPlace("4-Hit DMG 2")).toBe(2);
  });

  test("reads a title's trailing letter as its place counting from `A` as 1, `4-Hit DMG B` as 2", () => {
    expect.hasAssertions();

    expect(readHitPlace("4-Hit DMG B")).toBe(2);
  });

  test("reads no place where the title ends in no whole number or letter, as `4-Hit DMG` ends in its DMG", () => {
    expect.hasAssertions();

    expect(readHitPlace("4-Hit DMG")).toBeUndefined();
  });
});
