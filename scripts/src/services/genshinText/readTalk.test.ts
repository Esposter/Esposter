import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";

import { readTalk } from "#src/services/genshinText/readTalk";
import { choiceTalkLineSchema, TalkLineKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readTalk, () => {
  const TALK_ID = 1;
  const NPC_ID = "0";
  const NPC_TABLES = {
    npcNameTextIdMap: new Map([[NPC_ID, "0"]]),
    npcTitleTextIdMap: new Map([[NPC_ID, "1"]]),
    talkConfigMap: new Map(),
  };
  const createTalkTables = (dialogs: { dialog: DumpedDialog; id: number }[]) => ({
    ...NPC_TABLES,
    talkDialogsMap: new Map([[TALK_ID, dialogs]]),
  });

  test("reads a talk's dialogs as lines, the Traveler's as replies", () => {
    expect.hasAssertions();

    const talk = readTalk(TALK_ID, {
      ...createTalkTables([
        { dialog: { nextDialogs: [101], talkContentTextMapHash: 0, talkRole: { type: "TALK_ROLE_PLAYER" } }, id: 100 },
        { dialog: { nextDialogs: [-1], talkContentTextMapHash: 0, talkRole: { id: NPC_ID } }, id: 101 },
      ]),
      talkConfigMap: new Map([
        [TALK_ID, { beginCond: [], id: TALK_ID, initDialog: 100, npcId: [Number(NPC_ID)], questId: 0 }],
      ]),
    });

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
        {
          id: "101",
          kind: TalkLineKind.Spoken,
          nextLineIds: [],
          speakerRoleTextId: "1",
          speakerTextId: "0",
          textId: "0",
          voiceId: "",
        },
      ],
      npcIds: [NPC_ID],
      startLineId: "100",
    });
  });

  test("follows each line with the next when no dialog names a follower", () => {
    expect.hasAssertions();

    const talk = readTalk(
      TALK_ID,
      createTalkTables([
        { dialog: { nextDialogs: [], talkContentTextMapHash: 0, talkRole: {} }, id: 101 },
        { dialog: { nextDialogs: [], talkContentTextMapHash: 0, talkRole: {} }, id: 100 },
      ]),
    );

    expect(talk.lines.map(({ nextLineIds }) => nextLineIds)).toStrictEqual([["101"], []]);
  });

  test("reads a black screen's narration with no speaker or role", () => {
    expect.hasAssertions();

    const talk = readTalk(
      TALK_ID,
      createTalkTables([
        {
          dialog: { nextDialogs: [], talkContentTextMapHash: 0, talkRole: { id: "", type: "TALK_ROLE_BLACK_SCREEN" } },
          id: 100,
        },
      ]),
    );

    expect(talk.lines).toStrictEqual([
      {
        id: "100",
        kind: TalkLineKind.Spoken,
        nextLineIds: [],
        speakerRoleTextId: "",
        speakerTextId: "",
        textId: "0",
        voiceId: "",
      },
    ]);
  });
});
