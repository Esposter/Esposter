import type { Character } from "#src/models/character/Character";

import englishNameText from "#src/generated/nameText/English.json";
import artifactExpMaterials from "#src/generated/stats/artifactExpMaterials.json";
import artifactMainAffixCurves from "#src/generated/stats/artifactMainAffixCurves.json";
import artifactMainAffixPools from "#src/generated/stats/artifactMainAffixPools.json";
import artifactRarities from "#src/generated/stats/artifactRarities.json";
import artifactSets from "#src/generated/stats/artifactSets.json";
import characterGrowCurves from "#src/generated/stats/characterGrowCurves.json";
import characters from "#src/generated/stats/characters.json";
import weaponGrowCurves from "#src/generated/stats/weaponGrowCurves.json";
import weapons from "#src/generated/stats/weapons.json";
import { parseStatTables } from "#src/services/character/parseStatTables";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Xilonen on the Attributes tab at level 90, the English PC client's character screen as the 21:9 recording shows her
// Beside fourteen of the player's other characters, the Traveler among them, their weapons held at the first level
const XILONEN_ID = 10000103;
const XILONEN_WEAPON_ID = 11101;
const XILONEN_MAX_LEVEL = 90;
const XILONEN_ASCENSION = 6;
const STAMINA = 240;
const ROSTER_IDS = [
  10000002,
  10000003,
  XILONEN_ID,
  10000007,
  10000016,
  10000022,
  10000026,
  10000029,
  10000030,
  10000033,
  10000035,
  10000037,
  10000038,
  10000041,
  10000042,
];
const roster: Character[] = ROSTER_IDS.map((id) => ({
  artifacts: [],
  ascension: id === XILONEN_ID ? XILONEN_ASCENSION : 0,
  id,
  level: id === XILONEN_ID ? XILONEN_MAX_LEVEL : 1,
  weapon: { ascension: 0, experience: 0, id: XILONEN_WEAPON_ID, level: 1, refinement: 1 },
}));

export const props = {
  activeCharacterId: XILONEN_ID,
  characters: roster,
  gameText: ENGLISH_GAME_TEXT,
  maxStamina: STAMINA,
  nameText: englishNameText,
  statTables: parseStatTables({
    artifactExpMaterials,
    artifactMainAffixCurves,
    artifactMainAffixPools,
    artifactRarities,
    artifactSets,
    characterGrowCurves,
    characters,
    weaponGrowCurves,
    weapons,
  }),
};
