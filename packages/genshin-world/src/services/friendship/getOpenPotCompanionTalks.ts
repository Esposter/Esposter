import type { Talk } from "#src/models/dialogue/Talk";
import type { PotCompanionDialogue } from "#src/models/friendship/PotCompanionDialogue";

import { checkIsFriendshipDialogueOpen } from "#src/services/friendship/checkIsFriendshipDialogueOpen";

// The talks a character's companion in the Serenitea Pot holds open at its Friendship Level under the quests finished, in
// The order the record holds them. A dialogue of another character is never one of them
export const getOpenPotCompanionTalks = (
  dialogues: readonly PotCompanionDialogue[],
  characterId: number,
  friendshipLevel: number,
  completedQuestIds: ReadonlySet<string>,
): Talk[] =>
  dialogues
    .filter(
      (dialogue) =>
        dialogue.characterId === characterId &&
        checkIsFriendshipDialogueOpen(dialogue, friendshipLevel, completedQuestIds),
    )
    .map(({ talk }) => talk);
