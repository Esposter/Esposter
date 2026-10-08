import { chooseTalkLine } from "#src/services/dialogue/chooseTalkLine";
import { TALK } from "#src/services/dialogue/constants.test";
import { describe, expect, test } from "vitest";

describe(chooseTalkLine, () => {
  test("goes down the chosen reply's branch", () => {
    expect.hasAssertions();

    expect(chooseTalkLine(TALK, { isRevealed: true, lineId: "1" }, "2")).toStrictEqual({
      isRevealed: false,
      lineId: "4",
    });
  });

  test("keeps a reply followed by replies on screen", () => {
    expect.hasAssertions();

    expect(chooseTalkLine(TALK, { isRevealed: true, lineId: "1" }, "3")).toStrictEqual({
      isRevealed: true,
      lineId: "3",
    });
  });

  test("ends the talk after a reply nothing follows", () => {
    expect.hasAssertions();

    expect(chooseTalkLine(TALK, { isRevealed: true, lineId: "3" }, "5")).toStrictEqual({
      isRevealed: false,
      lineId: "",
    });
  });

  test("refuses a reply the line does not offer", () => {
    expect.hasAssertions();

    expect(() => chooseTalkLine(TALK, { isRevealed: true, lineId: "1" }, "5")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: id, line 1 offers no 5]`,
    );
  });
});
