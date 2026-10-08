import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The game's tables a character is made from and its attributes summed from: what each main affix gives at each rarity
// And level, every artifact set, character and weapon by its id, and each curve characters and weapons grow along by
// The game's name for it, its multiplier at each level from 1
export interface StatTables {
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[];
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  characterGrowCurveMap: ReadonlyMap<string, readonly number[]>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>;
}
