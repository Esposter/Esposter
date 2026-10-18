import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { checkIsMeleeWeapon } from "#src/services/kit/checkIsMeleeWeapon";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";

// Whether a hit is melee: it sits in a normal or charged attack of a character wielding a melee weapon, whatever kind it is
// Dealt as
export const checkIsMeleeHit = ({ weaponType }: Pick<Combatant, "weaponType">, { actionAttackTag }: KitHit): boolean =>
  checkIsMeleeWeapon(weaponType) && checkIsNormalOrChargedAttack(actionAttackTag);
