import { englishNameText } from "#parity/englishNameText";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The first list of the Corridor's first chamber, its three Benedictions with their descriptions' text hashes, over the English
export const props = {
  choices: [
    { descriptionTextHash: 2678391198, towerBuffId: 4, weight: 100 },
    { descriptionTextHash: 685069742, towerBuffId: 23, weight: 100 },
    { descriptionTextHash: 2641986814, towerBuffId: 24, weight: 100 },
  ],
  gameText: ENGLISH_GAME_TEXT,
  nameText: englishNameText,
};
