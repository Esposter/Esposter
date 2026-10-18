import { DomainKind } from "genshin-world";

// The game's dungeon entry table in the dump, read by its name
export const DUNGEON_ENTRY_TABLE_NAME = "DungeonEntryExcelConfigData";
// The category of the scene point file the entrances' points are filed under, as the 7.1 dump names it
export const DOMAIN_POINT_CATEGORY = "points";
// The entry types that name a challenge domain's kind. The other entry types are one-time, trounce and event entrances,
// Which their own pages own
export const DungeonEntryTypeDomainKindMap: Partial<Record<string, DomainKind>> = {
  DUNGEN_ENTRY_TYPE_AVATAR_TALENT: DomainKind.Mastery,
  DUNGEN_ENTRY_TYPE_RELIQUARY: DomainKind.Blessing,
  DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE: DomainKind.Forgery,
};
