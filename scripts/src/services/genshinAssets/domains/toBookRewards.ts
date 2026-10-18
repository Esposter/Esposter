import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { DomainKind, RewardItem } from "genshin-world";

import { DOMAIN_TREE_COUNT_ROWS } from "#src/services/genshinAssets/domains/constants";
import { findTreeRow } from "#src/services/genshinAssets/domains/findTreeRow";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A Domain of Forgery's or Mastery's level pays its pair's books, each drawn between the least and most its rarity has in
// The Adventure Rank's row and to that row's average. A rarity the row has no count for is not paid, and a book whose rarity
// The materials do not name is refused rather than paid at no rarity
export const toBookRewards = (
  kind: DomainKind.Forgery | DomainKind.Mastery,
  books: number[],
  rarities: ReadonlyMap<number, number>,
  rank: number,
): RewardItem[] => {
  const { counts } = findTreeRow(DOMAIN_TREE_COUNT_ROWS[kind], rank);
  return books.flatMap((itemId) => {
    const rarity = rarities.get(itemId);
    if (rarity === undefined)
      throw new InvalidOperationError(Operation.Read, MATERIAL_TABLE_NAME, `has no material ${itemId}`);
    const range = counts[rarity];
    return range === undefined
      ? []
      : [{ averageCount: range.avg, itemId, maxCount: range.maxCount, minCount: range.minCount }];
  });
};
