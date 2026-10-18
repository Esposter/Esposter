import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";

// Which of a weapon's two ascension and refinement actions the screen offers. Ascend is offered only at its phase's level
// Cap, and only while a next phase exists; Refine only to a weapon with refinement costs of its own and a rank below the
// Maximum. The rules behind each press still refuse it, so an offer here never bypasses them
export const getWeaponActions = (
  weapon: Weapon,
  weaponData: WeaponData,
): { canAscend: boolean; canRefine: boolean } => ({
  canAscend:
    weapon.level === weaponData.ascensionPhases[weapon.ascension]?.maxLevel &&
    weaponData.ascensionPhases[weapon.ascension + 1] !== undefined,
  canRefine: weaponData.refinementCosts.length > 0 && weapon.refinement < MAX_WEAPON_REFINEMENT,
});
