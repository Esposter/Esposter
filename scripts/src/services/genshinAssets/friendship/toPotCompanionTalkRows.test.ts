import type { ExcelHomeWorldNpcRow } from "#src/models/genshinAssets/home/ExcelHomeWorldNpcRow";
import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

import { FETTER_GT_CONDITION_TYPE } from "#src/services/genshinAssets/friendship/constants";
import { toPotCompanionTalkRows } from "#src/services/genshinAssets/friendship/toPotCompanionTalkRows";
import { describe, expect, test } from "vitest";

describe(toPotCompanionTalkRows, () => {
  const CHARACTER_ID = 10000047;
  const NPC_ID = 9047;
  const NEW_TALK_CONDITION = { param: [String(NPC_ID), "", "1"], type: "QUEST_COND_HOMEWORLD_NPC_NEW_TALK" };
  const TALK_CONFIG = { beginCond: [], id: 0, initDialog: 1, npcId: [NPC_ID], questId: 0 };

  test("should open each companion's talk at the level its fetter condition names, one above it, and leave out the rest", () => {
    expect.hasAssertions();

    const talkConfigMap = new Map<number, DumpedTalkConfig>([
      [1, { ...TALK_CONFIG, beginCond: [NEW_TALK_CONDITION], id: 1 }],
      [
        2,
        {
          ...TALK_CONFIG,
          beginCond: [{ param: [String(CHARACTER_ID), "3", ""], type: FETTER_GT_CONDITION_TYPE }],
          id: 2,
        },
      ],
      [
        3,
        {
          ...TALK_CONFIG,
          beginCond: [{ param: [String(CHARACTER_ID), "6", ""], type: FETTER_GT_CONDITION_TYPE }],
          id: 3,
        },
      ],
    ]);
    const npcRows: ExcelHomeWorldNpcRow[] = [{ avatarID: CHARACTER_ID, talkIDs: [1, 2, 3] }, {}];

    expect(toPotCompanionTalkRows(npcRows, talkConfigMap)).toStrictEqual([
      { characterId: CHARACTER_ID, friendshipLevel: 4, talkId: 2 },
      { characterId: CHARACTER_ID, friendshipLevel: 7, talkId: 3 },
    ]);
  });
});
