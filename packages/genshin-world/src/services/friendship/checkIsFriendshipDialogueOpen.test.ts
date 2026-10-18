import type { FriendshipDialogue } from "#src/models/friendship/FriendshipDialogue";

import { checkIsFriendshipDialogueOpen } from "#src/services/friendship/checkIsFriendshipDialogueOpen";
import { describe, expect, test } from "vitest";

describe(checkIsFriendshipDialogueOpen, () => {
  const LEVEL = 4;
  const QUEST_ID = "39604";
  const dialogue: FriendshipDialogue = { friendshipLevel: LEVEL, questId: QUEST_ID };

  test("a dialogue that also waits on a quest stays closed until the quest is done", () => {
    expect.hasAssertions();

    expect(checkIsFriendshipDialogueOpen(dialogue, LEVEL, new Set())).toBe(false);
    expect(checkIsFriendshipDialogueOpen(dialogue, LEVEL, new Set([QUEST_ID]))).toBe(true);
  });

  test("a dialogue that waits on no quest opens once its level is reached", () => {
    expect.hasAssertions();
    const levelOnly: FriendshipDialogue = { friendshipLevel: LEVEL, questId: "" };

    expect(checkIsFriendshipDialogueOpen(levelOnly, LEVEL - 1, new Set())).toBe(false);
    expect(checkIsFriendshipDialogueOpen(levelOnly, LEVEL, new Set())).toBe(true);
  });
});
