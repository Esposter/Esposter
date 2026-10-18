import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { BluntActionMap } from "#src/services/gathering/BluntActionMap";

const MELEE_ACTION_ATTACK_TAGS = new Set<AttackTag>([AttackTag.ChargedAttack, AttackTag.NormalAttack]);
const MELEE_WEAPON_TYPES = new Set<WeaponType>([WeaponType.Claymore, WeaponType.Polearm, WeaponType.Sword]);

// A hit is blunt by the wiki's Blunt Attacks. The BluntActionMap's rows for its character and action come first.
// Otherwise it is blunt as a claymore's normal or charged attack, as a plunge by a sword, claymore or polearm, or as Geo
// Damage the hit itself deals: a hit with no element of its own is physical, whatever its character's element
const checkIsBlunt = ({ characterId, weaponType }: Combatant, hit: KitHit): boolean => {
  const { actionAttackTag } = hit;
  const mappedIsBlunt = actionAttackTag === undefined ? undefined : BluntActionMap[characterId]?.[actionAttackTag];
  if (mappedIsBlunt !== undefined) return mappedIsBlunt;
  if (
    weaponType === WeaponType.Claymore &&
    actionAttackTag !== undefined &&
    MELEE_ACTION_ATTACK_TAGS.has(actionAttackTag)
  )
    return true;
  if (actionAttackTag === AttackTag.PlungingAttack && weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType))
    return true;
  return hit.element === Element.Geo;
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
