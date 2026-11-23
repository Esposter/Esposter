import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { MasterlessLevelLift } from "#src/models/character/MasterlessLevelLift";
import type { ExpMaterial } from "#src/models/inventory/ExpMaterial";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The game's tables a character is made from, its attributes summed from, its artifacts enhanced from and its levels
// Raised with: what each main affix gives at each rarity and level, every artifact set, character and weapon by its id,
// Each curve characters and weapons grow along by the game's name for it, its multiplier at each level from 1, and the
// Rarity and EXP of each artifact an enhancement reads. The main affix pools an artifact is rolled from are not among
// Them, since only the drop that rolls one reads them
export interface StatTables {
  artifactExpMaterialMap: ReadonlyMap<number, ExpMaterial>;
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[];
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The items a character's level is raised with, the largest EXP first
  characterExpMaterials: readonly ExpMaterial[];
  // The EXP each level needs to rise past it, by its level less one
  characterExpToNext: readonly number[];
  characterGrowCurveMap: ReadonlyMap<string, readonly number[]>;
  // The lifts past a level cap with Masterless Stella Fortuna, each by the level it lifts from
  masterlessLevelLiftMap: ReadonlyMap<number, MasterlessLevelLift>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  // The items a weapon is enhanced with, the largest EXP first
  weaponEnhancementOres: readonly ExpMaterial[];
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>;
}
