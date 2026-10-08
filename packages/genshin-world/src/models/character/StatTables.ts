import type { ArtifactExpMaterial } from "#src/models/artifact/ArtifactExpMaterial";
import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";
import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The game's tables a character is made from and its attributes summed from: what each main affix gives at each rarity
// And level, every artifact set, character and weapon by its id, and each curve characters and weapons grow along by
// The game's name for it, its multiplier at each level from 1. The artifact tables are what an artifact is rolled and
// Enhanced from: its rarity's levels and minor affixes, each slot's main affix pool, and the items that feed it EXP
export interface StatTables {
  artifactExpMaterialMap: ReadonlyMap<number, ArtifactExpMaterial>;
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[];
  artifactMainAffixPoolMap: ReadonlyMap<ArtifactSlot, ArtifactMainAffixPool>;
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  characterGrowCurveMap: ReadonlyMap<string, readonly number[]>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>;
}
