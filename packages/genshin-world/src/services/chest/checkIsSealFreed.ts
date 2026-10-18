import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { ChestSeal } from "#src/models/chest/ChestSeal";
import { Element } from "#src/models/Element";
import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";

// Whether a strike frees a chest's seal: Pyro breaks the Dendro vines and the ice, and a blunt or poise-damaging attack
// Breaks the rock, as the wiki describes. A strike of any other kind leaves the seal in place
export const checkIsSealFreed = (
  seal: ChestSeal,
  combatant: Pick<Combatant, "characterId" | "element" | "weaponType">,
  hit: KitHit,
): boolean => {
  if (seal === ChestSeal.Rock) return checkIsBluntHit(combatant, hit) || hit.poiseDamage > 0;
  return getKitHitElement(hit, combatant) === Element.Pyro;
};
