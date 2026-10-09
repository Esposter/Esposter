import { checkTouchesOverlap } from "#src/services/fleet/checkTouchesOverlap";
import { describe, expect, test } from "vitest";

describe(checkTouchesOverlap, () => {
  test("reads a path shared by two touch sets as an overlap", () => {
    expect.hasAssertions();

    expect(checkTouchesOverlap(["a/b.ts"], ["c.ts", "a/b.ts"])).toBe(true);
  });

  test("reads a directory and a path under it as an overlap, a trailing slash aside", () => {
    expect.hasAssertions();

    expect(checkTouchesOverlap(["extracted/natlan/"], ["extracted/natlan/world/world.json"])).toBe(true);
  });

  test("reads sibling paths sharing a name prefix as no overlap", () => {
    expect.hasAssertions();

    expect(checkTouchesOverlap(["extracted/natlan"], ["extracted/natlan-2/world.json"])).toBe(false);
  });

  test("reads a glob as the directory it opens in, so the paths it matches overlap", () => {
    expect.hasAssertions();

    expect(checkTouchesOverlap(["extracted/natlan/*.json"], ["extracted/natlan/world/world.json"])).toBe(true);
    expect(checkTouchesOverlap(["extracted/natlan/**"], ["extracted/liyue/world.json"])).toBe(false);
  });

  test("reads an empty touch set as overlapping nothing", () => {
    expect.hasAssertions();

    expect(checkTouchesOverlap([], ["a.ts"])).toBe(false);
  });
});
