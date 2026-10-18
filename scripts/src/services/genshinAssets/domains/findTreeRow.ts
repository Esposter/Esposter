import { takeOne } from "@esposter/shared";

// The row a level reads from a table sorted by Adventure Rank: the greatest rank not above the level's, or the lowest row
// For a level below every row
export const findTreeRow = <T extends { rank: number }>(rows: T[], rank: number): T =>
  rows.findLast((row) => row.rank <= rank) ?? takeOne(rows);
