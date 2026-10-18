import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";

const MELEE_ACTION_ATTACK_TAGS = new Set<AttackTag>([AttackTag.ChargedAttack, AttackTag.NormalAttack]);
const MELEE_WEAPON_TYPES = new Set<WeaponType>([WeaponType.Claymore, WeaponType.Polearm, WeaponType.Sword]);

// A hit is blunt by the wiki's Blunt Attacks, read off the attributes it carries: a claymore's normal or charged attack, a
// Plunge by a sword, claymore or polearm, and Geo damage. The wiki's ability exceptions and its explosions carry no
// Attribute of their own, so they read as the rest do
const checkIsBlunt = ({ element, weaponType }: Combatant, hit: KitHit): boolean => {
  const { actionAttackTag } = hit;
  if (
    weaponType === WeaponType.Claymore &&
    actionAttackTag !== undefined &&
    MELEE_ACTION_ATTACK_TAGS.has(actionAttackTag)
  )
    return true;
  if (actionAttackTag === AttackTag.PlungingAttack && weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType))
    return true;
  return (hit.element ?? element) === Element.Geo;
};

// The hit an ore takes from a hit a step landed for the character on the field, read before an infusion copies it. A
// Hit is melee when it sits in a normal or charged attack of a character wielding a sword, a claymore or a polearm, and
// Blunt by checkIsBlunt
export const readOreHit = (combatant: Combatant, hit: KitHit): OreHit => ({
  hitArea: hit.hitArea,
  isBlunt: checkIsBlunt(combatant, hit),
  isMelee:
    combatant.weaponType !== undefined &&
    MELEE_WEAPON_TYPES.has(combatant.weaponType) &&
    hit.actionAttackTag !== undefined &&
    MELEE_ACTION_ATTACK_TAGS.has(hit.actionAttackTag),
  poiseDamage: hit.poiseDamage,
});
