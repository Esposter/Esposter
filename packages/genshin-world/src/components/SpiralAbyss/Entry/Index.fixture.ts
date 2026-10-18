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
// A made-up floor with its three chambers, beside a blessing read by its game text hashes over the English names
const floors: AbyssFloor[] = [
  { chambers: [chamber(11, 1), chamber(12, 2), chamber(13, 3)], id: 1, index: 1, teamCount: 1, unlockStarCount: 1 },
];
export const props = {
  blessing: { descriptionTextHash: 2415435448, icon: "UI_TowerBlessing_107", nameTextHash: 1867767671 },
  floors,
  gameText: ENGLISH_GAME_TEXT,
  nameText: englishNameText,
};
