import type { Talk } from "#src/models/dialogue/Talk";
import type { PotCompanionDialogue } from "#src/models/friendship/PotCompanionDialogue";

import { getOpenPotCompanionTalks } from "#src/services/friendship/getOpenPotCompanionTalks";
import { describe, expect, test } from "vitest";

describe(getOpenPotCompanionTalks, () => {
  const CHARACTER_ID = 10000047;
  const OTHER_CHARACTER_ID = 10000048;
  const LEVEL = 4;
  const talk: Talk = { id: "", lines: [], npcIds: [], startLineId: "" };
  const dialogues: PotCompanionDialogue[] = [{ characterId: CHARACTER_ID, friendshipLevel: LEVEL, questId: "", talk }];

  test("a pot companion's dialogue opens at Friendship Level 4", () => {
    expect.hasAssertions();

    expect(getOpenPotCompanionTalks(dialogues, CHARACTER_ID, LEVEL - 1, new Set())).toStrictEqual([]);
    expect(getOpenPotCompanionTalks(dialogues, CHARACTER_ID, LEVEL, new Set())).toStrictEqual([talk]);
    expect(getOpenPotCompanionTalks(dialogues, OTHER_CHARACTER_ID, LEVEL, new Set())).toStrictEqual([]);
  });
});
