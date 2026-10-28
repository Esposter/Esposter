import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { GameTextKey } from "genshin-text";

// The text each outcrop's blossom is named by: the Blossom of Revelation and the Blossom of Wealth
export const OutcropKindNameKeyMap: Record<OutcropKind, GameTextKey> = {
  [OutcropKind.Revelation]: GameTextKey.BlossomOfRevelation,
  [OutcropKind.Wealth]: GameTextKey.BlossomOfWealth,
};
