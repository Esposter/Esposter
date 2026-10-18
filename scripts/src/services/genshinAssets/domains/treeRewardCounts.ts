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
// The four artifact sets of each Domain of Blessing, by entry id, as each domain's wiki infobox gives them: the `sets`
// Line of its page on https://genshin-impact.fandom.com/wiki/Domain_of_Blessing. A name is resolved to its set id through
// The dump's equip affixes by resolveBlessingArtifactSetIds, so no set id is typed in
export const BLESSING_ARTIFACT_SET_NAMES: Readonly<Record<number, readonly string[]>> = {
  1: ["Thundering Fury", "Thundersoother", "Resolution of Sojourner", "Adventurer"],
  6: ["Viridescent Venerer", "Maiden Beloved", "Tiny Miracle", "Traveling Doctor"],
  7: ["Archaic Petra", "Retracing Bolide", "Brave Heart", "Lucky Dog"],
  8: ["Crimson Witch of Flames", "Lavawalker", "Defender's Will", "Martial Artist"],
  9: ["Bloodstained Chivalry", "Noblesse Oblige", "Gambler", "Scholar"],
  12: ["Blizzard Strayer", "Heart of Depth", "Defender's Will", "Gambler"],
  13: ["Tenacity of the Millelith", "Pale Flame", "Brave Heart", "Martial Artist"],
  16: ["Shimenawa's Reminiscence", "Emblem of Severed Fate", "Resolution of Sojourner", "Tiny Miracle"],
  17: ["Husk of Opulent Dreams", "Ocean-Hued Clam", "Defender's Will", "Brave Heart"],
  18: ["Vermillion Hereafter", "Echoes of an Offering", "Martial Artist", "Gambler"],
  20: ["Deepwood Memories", "Gilded Dreams", "Tiny Miracle", "Gambler"],
  22: ["Desert Pavilion Chronicle", "Flower of Paradise Lost", "Resolution of Sojourner", "Brave Heart"],
  23: ["Nymph's Dream", "Vourukasha's Glow", "Martial Artist", "Scholar"],
  26: ["Marechaussee Hunter", "Golden Troupe", "Resolution of Sojourner", "Defender's Will"],
  27: ["Song of Days Past", "Nighttime Whispers in the Echoing Woods", "Tiny Miracle", "Martial Artist"],
  28: ["Fragment of Harmonic Whimsy", "Unfinished Reverie", "Brave Heart", "Scholar"],
  31: ["Scroll of the Hero of Cinder City", "Obsidian Codex", "Resolution of Sojourner", "Gambler"],
  32: ["Long Night's Oath", "Finale of the Deep Galleries", "Tiny Miracle", "Scholar"],
  35: ["Night of the Sky's Unveiling", "Silken Moon's Serenade", "Resolution of Sojourner", "Gambler"],
  36: ["Aubade of Morningstar and Moon", "A Day Carved From Rising Winds", "Tiny Miracle", "Instructor"],
  37: ["Celestial Gift", "Disenchantment in Deep Shadow", "Berserker", "The Exile"],
  40: ["Scarlet Proof", "Heart of the Furnace", "The Exile", "Brave Heart"],
};
