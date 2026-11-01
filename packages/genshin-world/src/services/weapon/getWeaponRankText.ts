import type { GameText } from "genshin-text";

import { fillGameTextValues, GameTextKey } from "genshin-text";

// The refinement rank a weapon holds, written in the game's own words for its rank
export const getWeaponRankText = (gameText: GameText, refinement: number): string =>
  fillGameTextValues(gameText[GameTextKey.WeaponRefinementRank], refinement);
