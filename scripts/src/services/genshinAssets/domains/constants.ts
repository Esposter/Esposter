import type { TreeArtifactRow } from "#src/models/genshinAssets/domains/TreeArtifactRow";
import type { TreeCountRow } from "#src/models/genshinAssets/domains/TreeCountRow";
import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

import { DungeonEntryTypeDomainKind } from "#src/models/genshinAssets/domains/DungeonEntryTypeDomainKind";
import { SCENE_POINT_CATEGORY, SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { DomainKind, GameDataset, SUNDAY_DAY_OF_WEEK } from "genshin-world";

// The game's dungeon entry table in the dump, read by its name
export const DUNGEON_ENTRY_TABLE_NAME = "DungeonEntryExcelConfigData";
// The exemplar of a challenge domain's entrance point: one entrance's point, which every entrance's point is of the one kind,
// Named by the fields that kind holds its transport place and its turn in, as the 7.1 dump names them
export const DOMAIN_ENTRANCE_POINT: ScenePointExemplar = {
  category: SCENE_POINT_CATEGORY,
  file: SCENE_POINT_FILE,
  id: "42",
  position: "tranPos",
  rotation: "tranRot",
};
// The field an entrance's point files the area it stands in under: the game's area table's level-one id, which names the
// Catalogue area the entrance is filed under. The dump leaves it out of a point at its default, 0, which names no area
export const DOMAIN_ENTRANCE_AREA_FIELD = "areaId";
// The field of an entrance's point holding the title text id its name is read from, which every entrance's point holds
export const DOMAIN_ENTRANCE_TITLE_FIELD = "titleTextID";
// The entry types that name a challenge domain's kind. The other entry types are one-time, trounce and event entrances,
// Which their own pages own
export const DungeonEntryTypeDomainKindMap: Partial<Record<string, DomainKind>> = {
  [DungeonEntryTypeDomainKind.DungeonEntryTypeAvatarTalent]: DomainKind.Mastery,
  [DungeonEntryTypeDomainKind.DungeonEntryTypeReliquary]: DomainKind.Blessing,
  [DungeonEntryTypeDomainKind.DungeonEntryTypeWeaponPromote]: DomainKind.Forgery,
};
// The dungeon level entity table in the dump, read by its name
export const DUNGEON_LEVEL_ENTITY_TABLE_NAME = "DungeonLevelEntityConfigData";
// The dungeon table in the dump, read by its name
export const DUNGEON_TABLE_NAME = "DungeonExcelConfigData";
// The reward preview table a level's clear names its rewards in
export const REWARD_PREVIEW_TABLE_NAME = "RewardPreviewExcelConfigData";
// The type a challenge domain's level is named by in the dungeon table
export const DOMAIN_LEVEL_TYPE = "DUNGEON_DAILY_FIGHT";
// The dungeon entries of the weekly bosses' trounce domains, read by id: Stormterror's, whose levels the entry's own list names
export const WEEKLY_BOSS_ENTRY_IDS: number[] = [1006];
// The type a weekly boss's level is named by in the dungeon table
export const WEEKLY_BOSS_DUNGEON_TYPE = "DUNGEON_BOSS";
// The record the weekly bosses' trounce domains publish under, in the domains dataset
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const WEEKLY_BOSS_DOMAINS_KEY: string = `${GameDataset.Domains}/weeklyBosses`;
// The days of the week, Monday as 1, each of a Domain of Forgery's or Mastery's day pairs is set for, in the order its
// Entry's day lists give them: Monday and Thursday, Tuesday and Friday, Wednesday and Saturday
export const DOMAIN_DAY_PAIRS: number[][] = [
  [1, 4],
  [2, 5],
  [3, 6],
];
// The Sunday every stage of a Domain of Forgery or Mastery is open on, in the same numbering
export const SUNDAY_DAYS_OF_WEEK: number[] = [SUNDAY_DAY_OF_WEEK];

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
