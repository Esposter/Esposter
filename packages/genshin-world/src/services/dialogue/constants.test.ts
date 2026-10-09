import type { Talk } from "#src/models/dialogue/Talk";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { DialogueChoiceIcon } from "genshin-interface";
import { describe } from "vitest";

// The hand-written sample talk every runner suite walks: two spoken lines, the second offering two replies, one leading
// On to a last spoken line and the other followed straight by a reply of its own that ends the talk
export const TALK: Talk = {
  id: "id",
  lines: [
    {
      id: "0",
      kind: TalkLineKind.Spoken,
      nextLineIds: ["1"],
      speakerTextId: "speakerTextId",
      speakerRoleTextId: "",
      textId: "textId",
      voiceId: "voiceId",
    },
    {
      id: "1",
      kind: TalkLineKind.Spoken,
      nextLineIds: ["2", "3"],
      speakerTextId: "speakerTextId",
      speakerRoleTextId: "",
      textId: "textId",
      voiceId: "voiceId",
    },
    { icon: DialogueChoiceIcon.Talk, id: "2", kind: TalkLineKind.Choice, nextLineIds: ["4"], textId: "textId" },
    { icon: DialogueChoiceIcon.Quest, id: "3", kind: TalkLineKind.Choice, nextLineIds: ["5"], textId: "textId" },
    {
      id: "4",
      kind: TalkLineKind.Spoken,
      nextLineIds: [],
      speakerTextId: "speakerTextId",
      speakerRoleTextId: "",
      textId: "textId",
      voiceId: "voiceId",
    },
    { icon: DialogueChoiceIcon.Talk, id: "5", kind: TalkLineKind.Choice, nextLineIds: [], textId: "textId" },
  ],
  startLineId: "0",
};

describe.todo("constants");
