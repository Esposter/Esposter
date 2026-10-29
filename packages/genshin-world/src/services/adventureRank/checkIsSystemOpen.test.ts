import { ScreenKind } from "#src/models/screen/ScreenKind";
import { checkIsSystemOpen } from "#src/services/adventureRank/checkIsSystemOpen";
import { describe, expect, test } from "vitest";

describe(checkIsSystemOpen, () => {
  const belowRank = 1;
  const atRank = 2;
  const noQuests = new Set<number>();

  test("a system stays closed below its rank", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Friends, belowRank, noQuests)).toBe(false);
  });

  test("a system opens at its rank", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Friends, atRank, noQuests)).toBe(true);
  });

  test("a system stays closed until its quest is finished, at any rank", () => {
    expect.hasAssertions();

    const wishQuestId = 2010001;
    expect(checkIsSystemOpen(ScreenKind.Wish, 20, noQuests)).toBe(false);
    expect(checkIsSystemOpen(ScreenKind.Wish, 20, new Set([wishQuestId]))).toBe(true);
  });

  test("Co-Op Mode needs both its rank and its quest", () => {
    expect.hasAssertions();

    const coOpQuestId = 35001;
    expect(checkIsSystemOpen(ScreenKind.CoOp, 16, noQuests)).toBe(false);
    expect(checkIsSystemOpen(ScreenKind.CoOp, 15, new Set([coOpQuestId]))).toBe(false);
    expect(checkIsSystemOpen(ScreenKind.CoOp, 16, new Set([coOpQuestId]))).toBe(true);
  });

  test("a system neither map gates is open from the start", () => {
    expect.hasAssertions();

    expect(checkIsSystemOpen(ScreenKind.Archive, belowRank, noQuests)).toBe(true);
  });
});
