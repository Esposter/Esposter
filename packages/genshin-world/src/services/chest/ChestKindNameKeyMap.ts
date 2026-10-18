import { ChestKind } from "#src/models/chest/ChestKind";
import { GameTextKey } from "genshin-text";

// Each kind's name in the game's text, by the key its row is named by: a rewarded kind's own name, and a buried chest's
// Name once dug. A kind with no name here, Sealed, has no row offered
export const ChestKindNameKeyMap: Partial<Record<ChestKind, GameTextKey>> = {
  [ChestKind.Buried]: GameTextKey.Chest,
  [ChestKind.Common]: GameTextKey.CommonChest,
  [ChestKind.Exquisite]: GameTextKey.ExquisiteChest,
  [ChestKind.Luxurious]: GameTextKey.LuxuriousChest,
  [ChestKind.Precious]: GameTextKey.PreciousChest,
  [ChestKind.Remarkable]: GameTextKey.RemarkableChest,
};
