import type { ChoiceTalkLine, SpokenTalkLine } from "genshin-world";

import { skipWordlessTalkLines } from "#src/services/genshinText/skipWordlessTalkLines";
import { choiceTalkLineSchema, TalkLineKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(skipWordlessTalkLines, () => {
  const WORDLESS_TEXT_ID = "0";
  const checkHasWords = (textId: string) => textId !== WORDLESS_TEXT_ID;
  const createSpokenLine = (id: string, nextLineIds: string[], textId = "1"): SpokenTalkLine => ({
    id,
    kind: TalkLineKind.Spoken,
    nextLineIds,
    speakerRoleTextId: "",
    speakerTextId: "",
    textId,
    voiceId: "",
  });

  test("goes on past a wordless line, the talk starting at the first line with words", () => {
    expect.hasAssertions();

    expect(
      skipWordlessTalkLines(
        {
          id: "0",
          lines: [
            createSpokenLine("0", ["1"], WORDLESS_TEXT_ID),
            createSpokenLine("1", ["2"]),
            createSpokenLine("2", ["3"], WORDLESS_TEXT_ID),
            createSpokenLine("3", []),
          ],
          npcIds: [],
          startLineId: "0",
        },
        checkHasWords,
      ),
    ).toStrictEqual({
      id: "0",
      lines: [createSpokenLine("1", ["3"]), createSpokenLine("3", [])],
      npcIds: [],
      startLineId: "1",
    });
  });

  test.each([
    [
      "a wordless reply",
      [
        createSpokenLine("0", ["1"]),
        {
          icon: choiceTalkLineSchema.shape.icon.enum.Talk,
          id: "1",
          kind: TalkLineKind.Choice,
          nextLineIds: [],
          textId: WORDLESS_TEXT_ID,
        } satisfies ChoiceTalkLine,
      ],
    ],
    [
      "a wordless line that branches",
      [createSpokenLine("0", ["1", "2"], WORDLESS_TEXT_ID), createSpokenLine("1", []), createSpokenLine("2", [])],
    ],
    ["no line with words", [createSpokenLine("0", [], WORDLESS_TEXT_ID)]],
  ])("reads no talk from %s", (_description, lines) => {
    expect.hasAssertions();

    expect(skipWordlessTalkLines({ id: "0", lines, npcIds: [], startLineId: "0" }, checkHasWords)).toBeUndefined();
  });
});
