import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArchiveTextLoaderMap } from "#src/services/archive/ArchiveTextLoaderMap";
import { readArchiveEntries } from "#src/services/archive/readArchiveEntries";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

const sectionEntriesMap = await readArchiveEntries(GAME_DATA_LOCAL_BASE_URL);
const textMap = await ArchiveTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);
const { weaponDataMap } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const rarityMap = new Map([...weaponDataMap].map(([id, { rarity }]) => [id, rarity]));
// The first forty weapons of the Equipment section are open, so the grid's rows read by name and the count reads forty
const OPENED_ENTRY_COUNT = 40;
const equipmentEntryIds = sectionEntriesMap[ArchiveSection.Equipment].slice(0, OPENED_ENTRY_COUNT).map(({ id }) => id);
const progressMap: ArchiveProgress = new Map([[ArchiveSection.Equipment, new Set(equipmentEntryIds)]]);
// Fillet Blade and White Iron Greatsword read dimmed, and the first weapon, picked, wears no "New" badge, as the still shows
const DIMMED_ENTRY_INDEXES = [13, 17];
const dimmedEntryIds = new Set(equipmentEntryIds.filter((_, index) => DIMMED_ENTRY_INDEXES.includes(index)));
const newEntryIds = new Set(equipmentEntryIds.filter((_, index) => index > 0 && !DIMMED_ENTRY_INDEXES.includes(index)));

export const props = {
  dimmedEntryIds,
  gameText: ENGLISH_GAME_TEXT,
  killsMap: new Map<number, number>(),
  newEntryIds,
  progressMap,
  rarityMap,
  sectionEntriesMap,
  textMap,
};
