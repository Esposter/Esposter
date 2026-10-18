import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { CharacterIdBluntActionMap } from "#src/services/kit/CharacterIdBluntActionMap";
import { checkIsMeleeHit } from "#src/services/kit/checkIsMeleeHit";
import { checkIsMeleeWeapon } from "#src/services/kit/checkIsMeleeWeapon";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";

// Whether a kit hit is a blunt attack, as the wiki's Blunt Attacks reads it and as Shatter, the Rock seal and the
// Ores take it. The CharacterIdBluntActionMap's row for its character and action comes first. Otherwise it is
// Blunt as a claymore's melee normal or charged attack, as a plunge by a melee weapon, or as Geo damage, read off
// The element the hit deals as strikeEnemy deals it: a hit with no element and no gauge is physical,
// Whatever its character's element
export const checkIsBluntHit = (
  combatant: Pick<Combatant, "characterId" | "element" | "weaponType">,
  hit: KitHit,
): boolean => {
  const { actionAttackTag } = hit;
  const mappedIsBlunt =
    actionAttackTag === undefined ? undefined : CharacterIdBluntActionMap[combatant.characterId]?.[actionAttackTag];
  if (mappedIsBlunt !== undefined) return mappedIsBlunt;
  if (combatant.weaponType === WeaponType.Claymore && checkIsMeleeHit(combatant, hit)) return true;
  if (actionAttackTag === AttackTag.PlungingAttack && checkIsMeleeWeapon(combatant.weaponType)) return true;
  return getKitHitElement(hit, combatant) === Element.Geo;
};
