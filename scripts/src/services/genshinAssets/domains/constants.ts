import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

import { SCENE_POINT_CATEGORY, SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { DomainKind, GameDataset } from "genshin-world";

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
// The entry types that name a challenge domain's kind. The other entry types are one-time, trounce and event entrances,
// Which their own pages own
export const DungeonEntryTypeDomainKindMap: Partial<Record<string, DomainKind>> = {
  DUNGEN_ENTRY_TYPE_AVATAR_TALENT: DomainKind.Mastery,
  DUNGEN_ENTRY_TYPE_RELIQUARY: DomainKind.Blessing,
  DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE: DomainKind.Forgery,
};
// The dungeon table in the dump, read by its name, and the reward preview table a level's clear names its rewards in
export const DUNGEON_TABLE_NAME = "DungeonExcelConfigData";
export const REWARD_PREVIEW_TABLE_NAME = "RewardPreviewExcelConfigData";
// The type a challenge domain's level is named by in the dungeon table
export const DOMAIN_LEVEL_TYPE = "DUNGEON_DAILY_FIGHT";
// The dungeon entries of the weekly bosses' trounce domains, read by id: Stormterror's, whose levels the entry's own list names
export const WEEKLY_BOSS_ENTRY_IDS: number[] = [1006];
// The type a weekly boss's level is named by in the dungeon table
export const WEEKLY_BOSS_DUNGEON_TYPE = "DUNGEON_BOSS";
// The record the weekly bosses' trounce domains publish under, in the domains dataset
export const WEEKLY_BOSS_DOMAINS_KEY = `${GameDataset.Domains}/weeklyBosses`;
// The days of the week, Monday as 1, each of a Domain of Forgery's or Mastery's day pairs is set for, in the order its
// Entry's day lists give them: Monday and Thursday, Tuesday and Friday, Wednesday and Saturday
export const DOMAIN_DAY_PAIRS: number[][] = [
  [1, 4],
  [2, 5],
  [3, 6],
];
// Every day of the week, which a Domain of Blessing is open on
export const ALL_DAYS_OF_WEEK: number[] = [1, 2, 3, 4, 5, 6, 7];
