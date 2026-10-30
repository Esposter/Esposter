import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import {
  ADVENTURER_HANDBOOK_UNLOCK_QUEST_ID,
  CO_OP_UNLOCK_QUEST_ID,
  WISH_UNLOCK_QUEST_ID,
} from "#src/services/adventureRank/constants";

// The game's open-state table (`OpenStateConfigData`) sets the main quests each Paimon menu system is finished for.
// The Wish (Gacha, id 31) and the Shop (Mall, id 900) come after quest 2010001.
// Co-Op Mode comes after quest 35001 as well as its rank (id 49).
// The Adventurer Handbook's quest 20505 is an estimate, as no open state names it.
// Its text ties it to that quest.
// The Events' quest 2010001 is an estimate too, as no open state names it.
// It opens like the Wish, which the game's tables gate on that quest.
// A system the map does not list has no quest to finish, so it is open from the start.
export const ScreenKindOpenQuestMap: Readonly<Partial<Record<TitledScreenKind, readonly number[]>>> = {
  [ScreenKind.AdventurerHandbook]: [ADVENTURER_HANDBOOK_UNLOCK_QUEST_ID],
  [ScreenKind.CoOp]: [CO_OP_UNLOCK_QUEST_ID],
  [ScreenKind.Events]: [WISH_UNLOCK_QUEST_ID],
  [ScreenKind.PaimonsBargains]: [WISH_UNLOCK_QUEST_ID],
  [ScreenKind.Wish]: [WISH_UNLOCK_QUEST_ID],
};
