import { advanceTalk } from "#src/services/dialogue/advanceTalk";
import { TALK } from "#src/services/dialogue/constants.test";
import { describe, expect, test } from "vitest";

describe(advanceTalk, () => {
  test("shows a line still being written out whole", () => {
    expect.hasAssertions();

    expect(advanceTalk(TALK, { isRevealed: false, lineId: "0" })).toStrictEqual({ isRevealed: true, lineId: "0" });
  });

  test("goes on from a whole line to the next", () => {
    expect.hasAssertions();

    expect(advanceTalk(TALK, { isRevealed: true, lineId: "0" })).toStrictEqual({ isRevealed: false, lineId: "1" });
  });

  test("waits on a line offering replies", () => {
    expect.hasAssertions();

    expect(advanceTalk(TALK, { isRevealed: true, lineId: "1" })).toStrictEqual({ isRevealed: true, lineId: "1" });
  });

  test("ends the talk after a line nothing follows", () => {
    expect.hasAssertions();

    expect(advanceTalk(TALK, { isRevealed: true, lineId: "4" })).toStrictEqual({ isRevealed: false, lineId: "" });
  });

  test("keeps an ended talk ended", () => {
    expect.hasAssertions();

    expect(advanceTalk(TALK, { isRevealed: false, lineId: "" })).toStrictEqual({ isRevealed: false, lineId: "" });
  });
});
