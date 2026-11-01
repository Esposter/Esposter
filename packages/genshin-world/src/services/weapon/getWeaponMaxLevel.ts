import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getWeaponData } from "#src/services/weapon/getWeaponData";

// The level cap of a weapon's phase, which the level text the game writes over the weapon is drawn against
export const getWeaponMaxLevel = (weaponDataMap: ReadonlyMap<number, WeaponData>, target: Weapon): number =>
  getWeaponData(weaponDataMap, target.id).ascensionPhases[target.ascension]?.maxLevel ?? target.level;
