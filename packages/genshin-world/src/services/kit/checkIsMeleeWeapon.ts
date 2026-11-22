import type { WeaponType } from "#src/models/weapon/WeaponType";

import { MELEE_WEAPON_TYPES } from "#src/services/kit/constants";

// Whether a weapon is melee: a sword, a claymore or a polearm, and not a bow or a catalyst
export const checkIsMeleeWeapon = (weaponType: undefined | WeaponType): boolean =>
  weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType);
