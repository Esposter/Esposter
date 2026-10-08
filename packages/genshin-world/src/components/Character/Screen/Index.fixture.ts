import type { Character } from "#src/models/character/Character";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Weapon } from "#src/models/weapon/Weapon";

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
import { CombatTalent } from "#src/models/character/CombatTalent";
import { parseStatTables } from "#src/services/character/parseStatTables";
import { CharacterMenuTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Xilonen on the Attributes tab at level 90, the English PC client's character screen as the 21:9 recording shows her
// Beside fourteen of the player's other characters, the Traveler among them, their weapons held at the first level
const XILONEN_ID = 10000103;
const XILONEN_MAX_LEVEL = 90;
// Xilonen's Peak Patrol Song at level 90 in its sixth phase and refinement five, and her three combat talents at 10, 13
// And 13, as the recording's Weapons and Talents tabs show them; the others hold the Dull Blade at the first level
const XILONEN_WEAPON: Weapon = { ascension: 6, experience: 0, id: 11516, level: 90, refinement: 5 };
const DULL_BLADE: Weapon = { ascension: 0, experience: 0, id: 11101, level: 1, refinement: 1 };
const XILONEN_TALENT_LEVELS: TalentLevels = {
  [CombatTalent.ElementalBurst]: 13,
  [CombatTalent.ElementalSkill]: 13,
  [CombatTalent.NormalAttack]: 10,
};
const XILONEN_ASCENSION = 6;
// All six of Xilonen's constellations activated, as the recording's Constellation tab shows them lit
const XILONEN_CONSTELLATION_COUNT = 6;
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
  constellationCount: id === XILONEN_ID ? XILONEN_CONSTELLATION_COUNT : 0,
  friendshipExp: 0,
  id,
  level: id === XILONEN_ID ? XILONEN_MAX_LEVEL : 1,
  stellaFortunaCount: 0,
  talentLevels:
    id === XILONEN_ID
      ? XILONEN_TALENT_LEVELS
      : { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: id === XILONEN_ID ? XILONEN_WEAPON : DULL_BLADE,
}));

export const props = {
  activeCharacterId: XILONEN_ID,
  characters: roster,
  gameText: ENGLISH_GAME_TEXT,
  initialTab: CharacterMenuTab.Attributes,
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

// The other tabs the English client shows at the same level, each opened on its own, the panel under it not drawn yet
export const variants = {
  artifacts: { initialTab: CharacterMenuTab.Artifacts },
  constellation: { initialTab: CharacterMenuTab.Constellation },
  talents: { initialTab: CharacterMenuTab.Talents },
  weapons: { initialTab: CharacterMenuTab.Weapons },
};
