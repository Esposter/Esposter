import type { WishItem } from "#src/models/wish/WishItem";

import { takeOne } from "@esposter/shared";

// One of a pool's items: a character or a weapon with equal chance where the pool holds both, as the standard wish's
// Details give each kind an equal share of a rarity, then any one of that kind
export const pickWishItem = (items: WishItem[], random: () => number): WishItem => {
  const kinds = [...new Set(items.map(({ kind }) => kind))];
  const kind = takeOne(kinds, Math.floor(random() * kinds.length));
  const kindItems = items.filter((item) => item.kind === kind);
  return takeOne(kindItems, Math.floor(random() * kindItems.length));
};
