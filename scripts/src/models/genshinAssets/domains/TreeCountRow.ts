import type { TreeCountRange } from "#src/models/genshinAssets/domains/TreeCountRange";

// One Adventure Rank's row of a table: a rarity with no row's count is not drawn at all
export interface TreeCountRow {
  counts: Partial<Record<number, TreeCountRange>>;
  rank: number;
}
