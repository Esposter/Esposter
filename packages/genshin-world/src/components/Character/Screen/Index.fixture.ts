import type { Artifact } from "#src/models/artifact/Artifact";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Weapon } from "#src/models/weapon/Weapon";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { readStatTables } from "#src/services/character/readStatTables";
import { readTalentTables } from "#src/services/character/readTalentTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { readReliquarySets } from "#src/services/reliquary/readReliquarySets";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CharacterMenuTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const reliquarySets = await readReliquarySets(GAME_DATA_LOCAL_BASE_URL);
const { characterTalentKits, talentUpgradeMap } = await readTalentTables(GAME_DATA_LOCAL_BASE_URL);
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

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
// The Scroll of the Hero of Cinder City, whose two- and four-piece bonuses the recording shows lit, worn as five five-star
// Pieces. Each main and roll is read off the game's tables at the level given: Sands and Goblet hold their Defense main at
// +17 and +19, which with the Defense rolls on Plume and Circlet sum Xilonen's Defense to the recording's +1,398 from them
const SCROLL_SET_ID = 15037;
const ARTIFACT_RARITY = 5;
// The piece of the set a slot is rolled as: its five-star one that starts with four minor affixes
const getPieceItemId = (slot: ArtifactSlot): number => {
  const piece = reliquarySets
    .find(({ id }) => id === SCROLL_SET_ID)
    ?.pieces.find(
      (candidate) =>
        candidate.slot === slot && candidate.rarity === ARTIFACT_RARITY && candidate.startingMinorCount === 4,
    );
  if (!piece) throw new InvalidOperationError(Operation.Read, getPieceItemId.name, `${slot} of set ${SCROLL_SET_ID}`);
  return piece.itemId;
};
// A minor affix at its tier in the rarity's table, each roll worth that tier's value and the rolls summed on its one line
const getMinorAffix = (attribute: Attribute, tier: number, rolls = 1): AttributeLine => {
  const value = statTables.artifactRarityDataMap
    .get(ARTIFACT_RARITY)
    ?.minorAffixGroups.find((group) => group.attribute === attribute)?.values[tier];
  if (value === undefined)
    throw new InvalidOperationError(Operation.Read, getMinorAffix.name, `${attribute} at tier ${tier}`);
  return { attribute, value: value * rolls };
};
const createArtifact = (
  slot: ArtifactSlot,
  mainAffix: Attribute,
  level: number,
  minorAffixes: AttributeLine[],
): Artifact => ({
  experience: 0,
  isLocked: false,
  itemId: getPieceItemId(slot),
  level,
  mainAffix,
  minorAffixes,
  rarity: ARTIFACT_RARITY,
  setId: SCROLL_SET_ID,
  slot,
});
const XILONEN_ARTIFACTS: Artifact[] = [
  createArtifact(ArtifactSlot.FlowerOfLife, Attribute.Health, 20, [
    getMinorAffix(Attribute.ElementalMastery, 3),
    getMinorAffix(Attribute.Attack, 2),
    getMinorAffix(Attribute.HealthPercent, 1),
    getMinorAffix(Attribute.CriticalRate, 1),
  ]),
  createArtifact(ArtifactSlot.PlumeOfDeath, Attribute.Attack, 20, [
    getMinorAffix(Attribute.ElementalMastery, 3),
    getMinorAffix(Attribute.HealthPercent, 2),
    getMinorAffix(Attribute.DefensePercent, 3, 3),
    getMinorAffix(Attribute.CriticalDamage, 3),
  ]),
  createArtifact(ArtifactSlot.SandsOfEon, Attribute.DefensePercent, 17, [
    getMinorAffix(Attribute.ElementalMastery, 2),
    getMinorAffix(Attribute.EnergyRecharge, 3),
    getMinorAffix(Attribute.CriticalDamage, 1),
    getMinorAffix(Attribute.CriticalRate, 1),
  ]),
  createArtifact(ArtifactSlot.GobletOfEonothem, Attribute.DefensePercent, 19, [
    getMinorAffix(Attribute.ElementalMastery, 0),
    getMinorAffix(Attribute.Attack, 2),
    getMinorAffix(Attribute.EnergyRecharge, 1),
    getMinorAffix(Attribute.CriticalRate, 2),
  ]),
  createArtifact(ArtifactSlot.CircletOfLogos, Attribute.CriticalDamage, 20, [
    getMinorAffix(Attribute.ElementalMastery, 0),
    getMinorAffix(Attribute.DefensePercent, 3, 3),
    getMinorAffix(Attribute.EnergyRecharge, 2),
    getMinorAffix(Attribute.CriticalRate, 3),
  ]),
];
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
  artifacts: id === XILONEN_ID ? XILONEN_ARTIFACTS : [],
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

// No set is read here, so Activate is refused with no set to press, as it is for a character the table does not hold
export const props = {
  activeCharacterId: XILONEN_ID,
  adventureRank: 15,
  characterIdConstellationsMap: new Map<number, Constellation[]>(),
  characters: roster,
  characterTalentKits,
  gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
  gameText: ENGLISH_GAME_TEXT,
  initialTab: CharacterMenuTab.Attributes,
  inventory: EMPTY_INVENTORY,
  materialDataMap,
  maxStamina: STAMINA,
  nameText: englishNameText,
  reliquarySets,
  statTables,
  talentUpgradeMap,
  wallet: EMPTY_WALLET,
};

// The other tabs the English client shows at the same level, each opened on its own, the panel under it not drawn yet
export const variants = {
  artifacts: { initialTab: CharacterMenuTab.Artifacts },
  constellation: { initialTab: CharacterMenuTab.Constellation },
  talents: { initialTab: CharacterMenuTab.Talents },
  weapons: { initialTab: CharacterMenuTab.Weapons },
};
