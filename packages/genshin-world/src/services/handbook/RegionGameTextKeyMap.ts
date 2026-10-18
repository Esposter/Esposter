import { GameTextKey } from "genshin-text";

// The game's own name of each region a commission is preferred in, by the region key its daily tasks carry. Nod-Krai has no
// Name key in the dump yet, so its commissions list no region until one is read
export const RegionGameTextKeyMap: Record<string, GameTextKey | undefined> = {
  fontaine: GameTextKey.Fontaine,
  inazuma: GameTextKey.Inazuma,
  liyue: GameTextKey.Liyue,
  mondstadt: GameTextKey.Mondstadt,
  natlan: GameTextKey.Natlan,
  snezhnaya: GameTextKey.Snezhnaya,
  sumeru: GameTextKey.Sumeru,
};
