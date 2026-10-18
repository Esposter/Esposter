import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { englishNameText } from "#parity/englishNameText";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const chamber = (id: number, index: number) => ({
  conditions: [],
  halfMonsterDescribeIds: [],
  id,
  index,
  monsterLevel: 1,
});
// The Moon Spire's period from the 16th of October 2026, whose blessing is Stardread, over the English words and names,
// Offering the period's first floor with its three chambers
const floors: AbyssFloor[] = [
  {
    chambers: [chamber(401, 1), chamber(402, 2), chamber(403, 3)],
    id: 1134,
    index: 9,
    teamCount: 2,
    unlockStarCount: 0,
  },
];
export const props = {
  blessing: { descriptionTextHash: 2415435448, icon: "UI_TowerBlessing_107", nameTextHash: 1867767671 },
  floors,
  gameText: ENGLISH_GAME_TEXT,
  nameText: englishNameText,
};
