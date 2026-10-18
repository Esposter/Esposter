import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";

import { DungeonEntryTypeDomainKindMap, WEEKLY_BOSS_ENTRY_IDS } from "#src/services/genshinAssets/domains/constants";
import { DomainKind } from "genshin-world";

// The kind of domain an entry's entrance is. The dump types every Trounce Domain's entry alike, so a weekly boss's entry is
// Named by its id, and any other entry by its type. An entry of no kind gives none
export const getDomainEntryKind = (entry: ExcelDungeonEntryRow): DomainKind | undefined =>
  WEEKLY_BOSS_ENTRY_IDS.includes(entry.id) ? DomainKind.Trounce : DungeonEntryTypeDomainKindMap[entry.type];
