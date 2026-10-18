import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";

// Whether a weapon can be refined at all: it has refinement costs of its own and a rank below the maximum. The offer and
// The refinement both read it, so neither can be allowed a case the other refuses
export const checkCanRefineWeapon = (weapon: Weapon, weaponData: WeaponData): boolean =>
  weaponData.refinementCosts.length > 0 && weapon.refinement < MAX_WEAPON_REFINEMENT;
