import type { Talk } from "#src/models/dialogue/Talk";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { TALK } from "#src/services/dialogue/constants.test";
import { skipTalk } from "#src/services/dialogue/skipTalk";
import { describe, expect, test } from "vitest";

describe(skipTalk, () => {
  test("runs on to the next line offering replies, written out whole", () => {
    expect.hasAssertions();

    expect(skipTalk(TALK, { isRevealed: false, lineId: "0" })).toStrictEqual({ isRevealed: true, lineId: "1" });
  });

  test("runs on to the talk's end", () => {
    expect.hasAssertions();

    expect(skipTalk(TALK, { isRevealed: false, lineId: "4" })).toStrictEqual({ isRevealed: false, lineId: "" });
  });

  test("refuses a talk whose lines loop back with no reply", () => {
    expect.hasAssertions();

    const loopingTalk: Talk = {
      id: "id",
      lines: [
        {
          id: "0",
          kind: TalkLineKind.Spoken,
          nextLineIds: ["0"],
          speakerTextId: "speakerTextId",
          speakerRoleTextId: "",
          textId: "textId",
          voiceId: "voiceId",
        },
      ],
      startLineId: "0",
    };

    expect(() => skipTalk(loopingTalk, { isRevealed: false, lineId: "0" })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: id, loops back to line 0 with no reply]`,
    );
  });
});
