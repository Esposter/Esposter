import { ScreenKind } from "#src/models/screen/ScreenKind";
import { checkIsSystemOpen } from "#src/services/adventureRank/checkIsSystemOpen";
import { describe, expect, test } from "vitest";

describe(checkIsSystemOpen, () => {
  const belowRank = 1;
  const atRank = 2;

  test("a system's entry stays disabled below its rank", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Friends, belowRank)).toBe(false);
  });

  test("a system's entry enables at its rank", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Friends, atRank)).toBe(true);
  });

  test("a system the wiki's unlocks do not gate is open from the start", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Archive, belowRank)).toBe(true);
  });
});
