import { ChestKind } from "#src/models/chest/ChestKind";
import { GameTextKey } from "genshin-text";

// Each rewarded kind's name in the game's text, by the key its row is named by. The kinds the wallet does not reward
// Have no name here, since their rows are not offered
export const ChestKindNameKeyMap: Partial<Record<ChestKind, GameTextKey>> = {
  [ChestKind.Common]: GameTextKey.CommonChest,
  [ChestKind.Exquisite]: GameTextKey.ExquisiteChest,
  [ChestKind.Luxurious]: GameTextKey.LuxuriousChest,
  [ChestKind.Precious]: GameTextKey.PreciousChest,
  [ChestKind.Remarkable]: GameTextKey.RemarkableChest,
};
