import type { BaseKitHitRecord } from "#src/models/kit/record/BaseKitHitRecord";

import { ChestSeal } from "#src/models/chest/ChestSeal";
import { Element } from "#src/models/Element";

// Whether a strike frees a chest's seal: Pyro breaks the Dendro vines and the ice, and a blunt or poise-damaging attack
// Breaks the rock, as the wiki describes. A strike of any other kind leaves the seal in place
export const checkIsSealFreed = (
  seal: ChestSeal,
  strike: Partial<Pick<BaseKitHitRecord, "element" | "isBlunt">> & Pick<BaseKitHitRecord, "poiseDamage">,
): boolean => {
  if (seal === ChestSeal.Rock) return strike.isBlunt === true || strike.poiseDamage > 0;
  return strike.element === Element.Pyro;
};
