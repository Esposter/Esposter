import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getAscendableNextPhase } from "#src/services/character/getAscendableNextPhase";
import { checkCanRefineWeapon } from "#src/services/weapon/checkCanRefineWeapon";

// Which of a weapon's two ascension and refinement actions the screen offers. Ascend is offered only at its phase's level
// Cap, and only while a next phase exists; Refine only to a weapon with refinement costs of its own and a rank below the
// Maximum. The rules behind each press still refuse it, so an offer here never bypasses them
export const getWeaponActions = (
  weapon: Weapon,
  weaponData: WeaponData,
): { canAscend: boolean; canRefine: boolean } => ({
  canAscend: getAscendableNextPhase(weaponData.ascensionPhases, weapon.ascension, weapon.level) !== undefined,
  canRefine: checkCanRefineWeapon(weapon, weaponData),
});
