import type { Attribute } from "#src/models/character/Attribute";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";
import type { Except } from "type-fest";

import { priceReactionContributors } from "#src/services/kit/priceReactionContributors";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";

// A reaction's own hit written into the enemy in place, and whether it struck: each deployed contributor is priced by
// `price` in the order the team lists them, the priced damages are totalled by `total`, and the total is taken against
// The enemy's RES to the element. With no contributor it strikes nothing
export const strikeReactionContributors = ({
  context,
  contributorIds,
  element,
  enemy,
  owner,
  price,
  reaction,
  total,
}: {
  context: KitContext;
  contributorIds: ReadonlySet<number>;
  element: Element;
  enemy: Enemy;
  owner: Combatant | undefined;
  price: (level: number, attributeTotalMap: Record<Attribute, number>, damageBonus: number) => number;
  reaction: Except<KitReaction, "combatant"> | undefined;
  total: (damages: number[]) => number;
}): boolean => {
  const damages = priceReactionContributors(contributorIds, context, price, reaction);
  if (damages.length === 0) return false;
  strikeReactionDamage(enemy, element, total(damages), owner, context);
  return true;
};
