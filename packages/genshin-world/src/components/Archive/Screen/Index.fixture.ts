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
const progressMap: ArchiveProgress = new Map([
  [
    ArchiveSection.Equipment,
    new Set(sectionEntriesMap[ArchiveSection.Equipment].slice(0, OPENED_ENTRY_COUNT).map(({ id }) => id)),
  ],
]);

export const props = {
  gameText: ENGLISH_GAME_TEXT,
  killsMap: new Map<number, number>(),
  progressMap,
  rarityMap,
  sectionEntriesMap,
  textMap,
};
