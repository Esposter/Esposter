import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { checkCanRefineWeapon } from "#src/services/weapon/checkCanRefineWeapon";
import { getAscendableNextPhase } from "#src/services/weapon/getAscendableNextPhase";

// Which of a weapon's two ascension and refinement actions the screen offers. Ascend is offered only at its phase's level
// Cap, and only while a next phase exists; Refine only to a weapon with refinement costs of its own and a rank below the
// Maximum. The rules behind each press still refuse it, so an offer here never bypasses them
export const getWeaponActions = (
  weapon: Weapon,
  weaponData: WeaponData,
): { canAscend: boolean; canRefine: boolean } => ({
  canAscend: getAscendableNextPhase(weapon, weaponData) !== undefined,
  canRefine: checkCanRefineWeapon(weapon, weaponData),
});
