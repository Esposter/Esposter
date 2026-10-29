import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";

import { englishNameText } from "#parity/englishNameText";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The first list of the Corridor's first chamber, its three Benedictions with their descriptions' text hashes, over the English
const choices: AbyssBenedictionChoice[] = [
  { descriptionTextHash: 2678391710, icon: "sword", scope: "floor", towerBuffId: 4, weight: 100 },
  { descriptionTextHash: 76761782, icon: "sword", scope: "chamber", towerBuffId: 25, weight: 100 },
  { descriptionTextHash: 683653006, icon: "shield", scope: "floor", towerBuffId: 6, weight: 100 },
];

export const props = {
  chamber: 1,
  choices,
  floor: 1,
  gameText: ENGLISH_GAME_TEXT,
  // The middle card is lit at rest, as the reference shows it under the pointer
  litTowerBuffId: 25,
  nameText: englishNameText,
};
