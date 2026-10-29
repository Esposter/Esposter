import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";

// The main quests each system the Paimon menu lists is finished for, from the game's open-state table
// (`OpenStateConfigData`): the Wish (Gacha, id 31) and the Shop (Mall, id 900) after quest 2010001, and Co-Op Mode after
// quest 35001 as well as its rank (id 49). The Adventurer Handbook's quest 20505 is an estimate, as no open state names it;
// its text ties it to that quest. The Events' quest 2010001 is an estimate too, as no open state names it: it opens like
// the Wish, which the game's tables gate on that quest
// A system the map does not list has no quest to finish, so it is open from the start
export const ScreenKindOpenQuestMap: Readonly<Partial<Record<TitledScreenKind, readonly number[]>>> = {
  [ScreenKind.AdventurerHandbook]: [20505],
  [ScreenKind.CoOp]: [35001],
  [ScreenKind.Events]: [2010001],
  [ScreenKind.PaimonsBargains]: [2010001],
  [ScreenKind.Wish]: [2010001],
};
