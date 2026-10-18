import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The stats a weapon's passive adds to its wielder at the refinement rank the weapon holds: the lines its table gives that
// Rank, carried whatever the passive's conditions. A weapon with no passive adds none
export const getWeaponPassiveAttributeLines = (weapon: Weapon, weaponData: WeaponData): AttributeLine[] =>
  weaponData.passiveRankAttributeLines[weapon.refinement - 1] ?? [];
