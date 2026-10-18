import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { checkIsMeleeWeapon } from "#src/services/kit/checkIsMeleeWeapon";

const MELEE_ACTION_ATTACK_TAGS = new Set<AttackTag>([AttackTag.ChargedAttack, AttackTag.NormalAttack]);

// Whether a hit is melee: it sits in a normal or charged attack of a character wielding a melee weapon, whatever kind it is
// Dealt as
export const checkIsMeleeHit = ({ weaponType }: Pick<Combatant, "weaponType">, { actionAttackTag }: KitHit): boolean =>
  checkIsMeleeWeapon(weaponType) && actionAttackTag !== undefined && MELEE_ACTION_ATTACK_TAGS.has(actionAttackTag);
