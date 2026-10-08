import { readTalk } from "#src/services/genshinText/readTalk";
import { choiceTalkLineSchema, TalkLineKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readTalk, () => {
  const TALK_ID = 1;
  const NPC_ID = "0";

  test("reads a talk's dialogs as lines, the Traveler's as replies", () => {
    expect.hasAssertions();

    const talk = readTalk(
      TALK_ID,
      [
        { dialog: { nextDialogs: [101], talkContentTextMapHash: 0, talkRole: { type: "TALK_ROLE_PLAYER" } }, id: 100 },
        { dialog: { nextDialogs: [-1], talkContentTextMapHash: 0, talkRole: { id: NPC_ID } }, id: 101 },
      ],
      new Map([[NPC_ID, "0"]]),
    );

    expect(talk).toStrictEqual({
      id: String(TALK_ID),
      lines: [
        {
          icon: choiceTalkLineSchema.shape.icon.enum.Talk,
          id: "100",
          kind: TalkLineKind.Choice,
          nextLineIds: ["101"],
          textId: "0",
        },
        { id: "101", kind: TalkLineKind.Spoken, nextLineIds: [], speakerTextId: "0", textId: "0", voiceId: "" },
      ],
      startLineId: "100",
    });
  });

  test("follows each line with the next when no dialog names a follower", () => {
    expect.hasAssertions();

    const talk = readTalk(
      TALK_ID,
      [
        { dialog: { nextDialogs: [], talkContentTextMapHash: 0 }, id: 101 },
        { dialog: { nextDialogs: [], talkContentTextMapHash: 0 }, id: 100 },
      ],
      new Map(),
    );

    expect(talk.lines.map(({ nextLineIds }) => nextLineIds)).toStrictEqual([["101"], []]);
  });
});
