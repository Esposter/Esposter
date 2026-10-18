import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

import { SCENE_POINT_CATEGORY, SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { DomainKind } from "genshin-world";

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
