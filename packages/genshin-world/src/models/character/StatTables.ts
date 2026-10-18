import type { ArtifactExpMaterial } from "#src/models/artifact/ArtifactExpMaterial";
import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The game's tables a character is made from, its attributes summed from and its artifacts enhanced from: what each main
// Affix gives at each rarity and level, every artifact set, character and weapon by its id, each curve characters and
// Weapons grow along by the game's name for it, its multiplier at each level from 1, and the rarity and EXP of each
// Artifact an enhancement reads. The main affix pools an artifact is rolled from are not among them, since only the drop
// That rolls one reads them
export interface StatTables {
  artifactExpMaterialMap: ReadonlyMap<number, ArtifactExpMaterial>;
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[];
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  characterGrowCurveMap: ReadonlyMap<string, readonly number[]>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>;
}
