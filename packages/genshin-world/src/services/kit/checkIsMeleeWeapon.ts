import { WeaponType } from "#src/models/weapon/WeaponType";

const MELEE_WEAPON_TYPES = new Set<WeaponType>([WeaponType.Claymore, WeaponType.Polearm, WeaponType.Sword]);

// Whether a weapon is melee: a sword, a claymore or a polearm, and not a bow or a catalyst
export const checkIsMeleeWeapon = (weaponType: WeaponType | undefined): boolean =>
  weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType);
