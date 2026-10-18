import type { FriendshipDialogue } from "#src/models/friendship/FriendshipDialogue";

// Whether a Friendship dialogue is open at a Friendship Level under the quests finished: the level it opens at reached, and
// The quest it waits on finished where it names one
export const checkIsFriendshipDialogueOpen = (
  dialogue: FriendshipDialogue,
  friendshipLevel: number,
  completedQuestIds: ReadonlySet<string>,
): boolean =>
  friendshipLevel >= dialogue.friendshipLevel && (dialogue.questId === "" || completedQuestIds.has(dialogue.questId));
