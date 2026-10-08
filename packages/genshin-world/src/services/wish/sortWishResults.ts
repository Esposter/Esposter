import type { WishResult } from "#src/models/wish/WishResult";

import { WishItemKind } from "#src/models/wish/WishItemKind";

// A set's results in the order the game shows them: the highest rarity first, a character ahead of a weapon of its
// Rarity, and otherwise the order they were drawn in
export const sortWishResults = (results: WishResult[]): WishResult[] =>
  results.toSorted(
    (firstResult, secondResult) =>
      secondResult.item.rarity - firstResult.item.rarity ||
      Number(firstResult.item.kind === WishItemKind.Weapon) - Number(secondResult.item.kind === WishItemKind.Weapon),
  );
