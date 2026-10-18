import type { TreeArtifact } from "genshin-world";

import { DomainKind } from "genshin-world";

// The counts a Domain of Forgery's or Mastery's Petrified Tree draws of one item of a rarity: the least and most a claim
// Draws, and the wiki's average, which the claim draws to (see drawRewardItems)
export interface TreeCountRange {
  avg: number;
  maxCount: number;
  minCount: number;
}

// One Adventure Rank's row of a table: a rarity with no row's count is not drawn at all
export interface TreeCountRow {
  counts: Partial<Record<number, TreeCountRange>>;
  rank: number;
}

// One Adventure Rank's row of the Domain of Blessing's table: the artifacts of each rarity a claim draws
export interface TreeArtifactRow {
  artifacts: TreeArtifact[];
  rank: number;
}

// The counts a Domain of Forgery's or Mastery's claim draws, from the wiki's Template:Domain_Levels/Forgery (Adventure
// Ranks 16, 21, 30 and 40, weapon ascension materials of two to five stars) and Template:Domain_Levels/Mastery (Adventure
// Ranks 27, 28, 36 and 45, talent books of two to four stars). The dump's levels stand at 15, 21, 30 and 40, and 25, 28, 36
// And 45, so a level reads the row of the greatest Adventure Rank not above its own (see `findTreeRow`)
export const DOMAIN_TREE_COUNT_ROWS: Record<DomainKind.Forgery | DomainKind.Mastery, TreeCountRow[]> = {
  [DomainKind.Forgery]: [
    { counts: { 2: { avg: 4.7, maxCount: 6, minCount: 4 } }, rank: 16 },
    { counts: { 2: { avg: 2.7, maxCount: 3, minCount: 2 }, 3: { avg: 2, maxCount: 2, minCount: 2 } }, rank: 21 },
    {
      counts: {
        2: { avg: 2.26, maxCount: 3, minCount: 2 },
        3: { avg: 2.76, maxCount: 3, minCount: 0 },
        4: { avg: 0.24, maxCount: 3, minCount: 0 },
      },
      rank: 30,
    },
    {
      counts: {
        2: { avg: 2.2, maxCount: 3, minCount: 2 },
        3: { avg: 2.418, maxCount: 4, minCount: 0 },
        4: { avg: 0.62, maxCount: 4, minCount: 0 },
        5: { avg: 0.062, maxCount: 4, minCount: 0 },
      },
      rank: 40,
    },
  ],
  [DomainKind.Mastery]: [
    { counts: { 2: { avg: 3.2, maxCount: 4, minCount: 3 } }, rank: 27 },
    { counts: { 2: { avg: 2.5, maxCount: 3, minCount: 2 }, 3: { avg: 1, maxCount: 1, minCount: 1 } }, rank: 28 },
    { counts: { 2: { avg: 1.8, maxCount: 2, minCount: 1 }, 3: { avg: 2, maxCount: 2, minCount: 2 } }, rank: 36 },
    {
      counts: {
        2: { avg: 2.2, maxCount: 3, minCount: 2 },
        3: { avg: 1.98, maxCount: 3, minCount: 0 },
        4: { avg: 0.22, maxCount: 3, minCount: 0 },
      },
      rank: 45,
    },
  ],
};

// The artifacts a Domain of Blessing's claim draws at each Adventure Rank, from the wiki's Template:Domain_Levels/Blessing,
// Each rarity as its guaranteed count and the chance, as a fraction, of one more. The rows are the same whichever Domain
// Level's table they are read from. A level at Adventure Rank 20 reads the lowest row, since the wiki's table starts at 22
export const BLESSING_TREE_ARTIFACT_ROWS: TreeArtifactRow[] = [
  {
    artifacts: [
      { chance: 0.97, guaranteedCount: 4, rarity: 2 },
      { chance: 0.13, guaranteedCount: 2, rarity: 3 },
    ],
    rank: 22,
  },
  {
    artifacts: [
      { chance: 0.414, guaranteedCount: 2, rarity: 2 },
      { chance: 0.686, guaranteedCount: 4, rarity: 3 },
    ],
    rank: 25,
  },
  {
    artifacts: [
      { chance: 0.39, guaranteedCount: 6, rarity: 3 },
      { chance: 0.71, guaranteedCount: 0, rarity: 4 },
    ],
    rank: 30,
  },
  {
    artifacts: [
      { chance: 0.68, guaranteedCount: 5, rarity: 3 },
      { chance: 0.42, guaranteedCount: 1, rarity: 4 },
    ],
    rank: 35,
  },
  {
    artifacts: [
      { chance: 0.97, guaranteedCount: 4, rarity: 3 },
      { chance: 0.775, guaranteedCount: 1, rarity: 4 },
      { chance: 0.355, guaranteedCount: 0, rarity: 5 },
    ],
    rank: 40,
  },
  {
    artifacts: [
      { chance: 0.55, guaranteedCount: 3, rarity: 3 },
      { chance: 0.485, guaranteedCount: 2, rarity: 4 },
      { chance: 0.065, guaranteedCount: 1, rarity: 5 },
    ],
    rank: 45,
  },
];

// The row a level reads from a table sorted by Adventure Rank: the greatest rank not above the level's, or the lowest row
// For a level below every row
export const findTreeRow = <T extends { rank: number }>(rows: T[], rank: number): T =>
  rows.findLast((row) => row.rank <= rank) ?? rows[0];
