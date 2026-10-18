import type { OutcropKind } from "#src/models/leyLine/OutcropKind";

import { GameTextKey } from "genshin-text";

// The text each outcrop's blossom is named by: the Blossom of Revelation and the Blossom of Wealth
export const OutcropKindNameKeyMap: Record<OutcropKind, GameTextKey> = {
  Revelation: GameTextKey.BlossomOfRevelation,
  Wealth: GameTextKey.BlossomOfWealth,
};
