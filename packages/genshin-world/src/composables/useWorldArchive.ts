import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameLanguage } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { GameDataset } from "#src/models/data/GameDataset";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ArchiveTextLoaderMap } from "#src/services/archive/ArchiveTextLoaderMap";
import { ARCHIVE_UNLOCK_QUEST_ID } from "#src/services/archive/constants";
import { countArchiveDefeat } from "#src/services/archive/countArchiveDefeat";
import { openArchiveEntries } from "#src/services/archive/openArchiveEntries";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";
import { openTravelLogEntries } from "#src/services/archive/openTravelLogEntries";
import { readArchiveEntries } from "#src/services/archive/readArchiveEntries";
import { readTravelLogEntries } from "#src/services/archive/readTravelLogEntries";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getResultAsync } from "@esposter/shared";
import { z } from "zod";

// The Archive's entries, the volumes it reads and the defeats it counts. Its entries are read once the quest it opens after
// Is done, as the game opens it, and its progress starts empty, the bag's items and the defeats opening its entries as they
// Come in
export const useWorldArchive = ({
  enemyKindMap,
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  language,
  screenKind,
}: {
  enemyKindMap: ReadonlyMap<EnemyKindId, EnemyKind>;
  events: WorldEvents;
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  gameDataBaseUrl: string;
  language: GameLanguage;
  screenKind: Ref<ScreenKind>;
}) => {
  const archiveData = shallowRef<ArchiveData>();
  const archiveProgressMap = shallowRef<ArchiveProgress>(new Map());
  // The volume the Archive is reading, its title and its text in the reader's language
  const bookReading = shallowRef<{ body: string; title: string }>();
  // The volume last chosen whose text is still loading, let go once the Archive closes, so a text that arrives for another
  // Volume or after the Archive has closed opens no reader
  let loadingBookId: number | undefined;
  watch(screenKind, (newScreenKind) => {
    if (newScreenKind !== ScreenKind.Archive) loadingBookId = undefined;
  });
  // The defeats of each Living Being, counted under its entry for the Archive to show
  const archiveKillsMap = shallowRef<ArchiveKills>(new Map());
  // A volume the Archive's Books section opens has its text read from the hosted game data in the reader's language,
  // When it opens
  const readBook = (bookId: number) => {
    if (!archiveData.value) return;
    const { sectionEntriesMap, textMap } = archiveData.value;
    const book = sectionEntriesMap[ArchiveSection.Books].find(({ id }) => id === bookId);
    if (!book) return;
    loadingBookId = bookId;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() =>
      readGameDataEntry(gameDataBaseUrl, `${GameDataset.BookBody}/${language}`, String(book.bodyId), z.string()),
    ).match(
      (body) => {
        if (loadingBookId !== bookId) return;
        loadingBookId = undefined;
        bookReading.value = { body, title: textMap[book.nameTextId] || "" };
      },
      (error) => {
        console.error(error);
      },
    );
  };
  const isArchiveUnlocked = computed(() => finishedMainQuestIds.value.has(ARCHIVE_UNLOCK_QUEST_ID));
  watch(isArchiveUnlocked, (newIsArchiveUnlocked) => {
    if (!newIsArchiveUnlocked || archiveData.value) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(async () => {
      const [sectionEntriesMap, textMap] = await Promise.all([
        readArchiveEntries(gameDataBaseUrl),
        ArchiveTextLoaderMap[language](gameDataBaseUrl),
      ]);
      return { sectionEntriesMap, textMap };
    }).match(
      (newArchiveData) => {
        archiveData.value = newArchiveData;
      },
      (error) => {
        console.error(error);
      },
    );
  });
  // The Travel Log entries of the main quests finished are opened as each one finishes, read off the Archive's table when
  // First needed, since the Archive's own screen may not have been opened
  events.on("parentQuestFinish", () => {
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readTravelLogEntries(gameDataBaseUrl)).match(
      (entries) => {
        archiveProgressMap.value = openTravelLogEntries(archiveProgressMap.value, entries, finishedMainQuestIds.value);
      },
      (error) => {
        console.error(error);
      },
    );
  });
  // Every change to the bag opens the entries of what the bag takes in
  events.on("bagChange", (nextInventory) => {
    archiveProgressMap.value = openArchiveEntries(archiveProgressMap.value, nextInventory.items);
  });
  // A defeated enemy's entry is opened and its defeat counted
  events.on("defeatEnemy", (enemy) => {
    const { archiveEntryId } = getEnemyKind(enemyKindMap, enemy.enemyKindId);
    archiveProgressMap.value = openArchiveEntry(archiveProgressMap.value, ArchiveSection.LivingBeings, archiveEntryId);
    archiveKillsMap.value = countArchiveDefeat(archiveKillsMap.value, archiveEntryId);
  });
  return { archiveData, archiveKillsMap, archiveProgressMap, bookReading, readBook };
};
