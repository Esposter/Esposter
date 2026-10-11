import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";

const MELEE_ACTION_ATTACK_TAGS = new Set<AttackTag>([AttackTag.ChargedAttack, AttackTag.NormalAttack]);
const MELEE_WEAPON_TYPES = new Set<WeaponType>([WeaponType.Claymore, WeaponType.Polearm, WeaponType.Sword]);

// The hit an ore takes from a hit a step landed for the character on the field, read before an infusion copies it. A
// Hit is melee when it sits in a normal or charged attack of a character wielding a sword, a claymore or a polearm
export const readOreHit = ({ weaponType }: Combatant, hit: KitHit): OreHit => ({
  hitArea: hit.hitArea,
  isBlunt: hit.isBlunt === true,
  isMelee:
    weaponType !== undefined &&
    MELEE_WEAPON_TYPES.has(weaponType) &&
    hit.actionAttackTag !== undefined &&
    MELEE_ACTION_ATTACK_TAGS.has(hit.actionAttackTag),
  poiseDamage: hit.poiseDamage,
});
