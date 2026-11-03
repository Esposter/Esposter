import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { bookBodySchema } from "#src/models/archive/ArchiveBook";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { GameDataset } from "#src/models/data/GameDataset";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ArchiveTextLoaderMap } from "#src/services/archive/ArchiveTextLoaderMap";
import { computeOfferedViewpoints } from "#src/services/archive/computeOfferedViewpoints";
import { ARCHIVE_UNLOCK_QUEST_ID } from "#src/services/archive/constants";
import { countArchiveDefeat } from "#src/services/archive/countArchiveDefeat";
import { getArchiveArtifacts } from "#src/services/archive/getArchiveArtifacts";
import { getViewpointPlaces } from "#src/services/archive/getViewpointPlaces";
import { openArchiveArtifactSets } from "#src/services/archive/openArchiveArtifactSets";
import { openArchiveBook } from "#src/services/archive/openArchiveBook";
import { openArchiveEntries } from "#src/services/archive/openArchiveEntries";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";
import { openTipArchiveEntry } from "#src/services/archive/openTipArchiveEntry";
import { openTravelLogEntries } from "#src/services/archive/openTravelLogEntries";
import { openViewpointArchiveEntry } from "#src/services/archive/openViewpointArchiveEntry";
import { readArchiveEntries } from "#src/services/archive/readArchiveEntries";
import { readTravelLogEntries } from "#src/services/archive/readTravelLogEntries";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readSceneGroups } from "#src/services/sceneGroup/readSceneGroups";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef, watch } from "vue";

// The Archive's entries, the volumes it reads and the defeats it counts. Its entries are read once the quest it opens after
// Is done, as the game opens it, and its progress and defeats are the save's, the bag's items and the defeats opening its
// Entries as they come in. The session starts it after the quests store and stops it as it unmounts
export const useWorldArchiveStore = defineStore("world/archive", () => {
  const worldQuestsStore = useWorldQuestsStore();
  const worldScreenStore = useWorldScreenStore();
  const worldSessionStore = useWorldSessionStore();
  const { events } = worldSessionStore;
  const archiveProgressMap = shallowRef<ArchiveProgress>(new Map());
  const archiveKillsMap = shallowRef<ArchiveKills>(new Map());
  // The tables an entry opens against, held for the session once it starts
  let enemyKindMap: ReadonlyMap<number, EnemyKind> = new Map();
  const archiveData = shallowRef<ArchiveData>();
  // The place each viewpoint stands at, as the scene group record gives it, read with the Archive's entries
  const viewpointPlaceMap = shallowRef<ReadonlyMap<number, SceneGroupPlace>>(new Map());
  // The volume the Archive is reading, its title and its text in the reader's language
  const bookReading = shallowRef<{ body: string; title: string }>();
  // The volume last chosen whose text is still loading, let go once the Archive closes, so a text that arrives for another
  // Volume or after the Archive has closed opens no reader
  let loadingBookId: number | undefined;
  watch(
    () => worldScreenStore.screenKind,
    (newScreenKind) => {
      if (newScreenKind !== ScreenKind.Archive) loadingBookId = undefined;
    },
  );
  // A volume the Archive's Books section opens has its text read from the hosted game data in the reader's language,
  // When it opens
  const readBook = async (bookId: number) => {
    if (!archiveData.value) return;
    const { sectionEntriesMap, textMap } = archiveData.value;
    const book = sectionEntriesMap[ArchiveSection.Books].find(({ id }) => id === bookId);
    if (!book) return;
    loadingBookId = bookId;
    await getResultAsync(() =>
      readGameDataEntry(
        worldSessionStore.gameDataBaseUrl,
        `${GameDataset.BookBody}/${worldSessionStore.language}`,
        String(book.bodyId),
        bookBodySchema,
      ),
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
  // The Equipment entry of each artifact set the bag holds every piece of is opened, once the Archive's entries are read,
  // Since an artifact set opens by what the bag holds whenever it is read
  const openHeldArtifactSets = (items: readonly InventoryItem[]) => {
    if (!archiveData.value) return;
    const equipmentEntryIds = new Set(
      archiveData.value.sectionEntriesMap[ArchiveSection.Equipment].map(({ id }) => id),
    );
    archiveProgressMap.value = openArchiveArtifactSets(
      archiveProgressMap.value,
      getArchiveArtifacts(items, worldSessionStore.reliquaryPieceEntryMap),
      equipmentEntryIds,
      worldSessionStore.reliquarySets,
    );
  };
  const isArchiveUnlocked = computed(() => worldQuestsStore.finishedMainQuestIds.has(ARCHIVE_UNLOCK_QUEST_ID));
  const loadArchive = getSynchronizedFunction(async () => {
    if (archiveData.value) return;
    await getResultAsync(async () => {
      const [sectionEntriesMap, textMap, sceneGroups] = await Promise.all([
        readArchiveEntries(worldSessionStore.gameDataBaseUrl),
        ArchiveTextLoaderMap[worldSessionStore.language](worldSessionStore.gameDataBaseUrl),
        readSceneGroups(worldSessionStore.gameDataBaseUrl),
      ]);
      return {
        placeMap: getViewpointPlaces(sceneGroups, sectionEntriesMap[ArchiveSection.Geography]),
        sectionEntriesMap,
        textMap,
      };
    }).match(
      ({ placeMap, sectionEntriesMap, textMap }) => {
        archiveData.value = { sectionEntriesMap, textMap };
        viewpointPlaceMap.value = placeMap;
        openHeldArtifactSets(worldSessionStore.inventory.items);
      },
      (error) => {
        console.error(error);
      },
    );
  });
  watch(isArchiveUnlocked, (newIsArchiveUnlocked) => {
    if (newIsArchiveUnlocked) loadArchive();
  });
  const start = (saved: {
    archiveKillsMap: ArchiveKills;
    archiveProgressMap: ArchiveProgress;
    enemyKindMap: ReadonlyMap<number, EnemyKind>;
  }) => {
    archiveKillsMap.value = saved.archiveKillsMap;
    archiveProgressMap.value = saved.archiveProgressMap;
    ({ enemyKindMap } = saved);
    // The quest may already be done as the world opens, when the watch above has nothing to change to
    if (isArchiveUnlocked.value) loadArchive();
    // The Travel Log entries of the main quests finished are opened as each one finishes, read off the Archive's table when
    // First needed, since the Archive's own screen may not have been opened
    events.on("parentQuestFinish", () => {
      // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
      getResultAsync(() => readTravelLogEntries(worldSessionStore.gameDataBaseUrl)).match(
        (entries) => {
          archiveProgressMap.value = openTravelLogEntries(
            archiveProgressMap.value,
            entries,
            worldQuestsStore.finishedMainQuestIds,
          );
        },
        (error) => {
          console.error(error);
        },
      );
    });
    // Every change to the bag opens the entries of what the bag takes in, and the Equipment entry of each artifact set the bag
    // Now holds every piece of
    events.on("bagChange", (nextInventory) => {
      archiveProgressMap.value = openArchiveEntries(archiveProgressMap.value, nextInventory.items);
      openHeldArtifactSets(nextInventory.items);
    });
    // A tutorial's entry opens the first time the world shows its tip, and stays as it is when the tip is shown again
    events.on("tipShown", (tip) => {
      archiveProgressMap.value = openTipArchiveEntry(archiveProgressMap.value, tip);
    });
    // A defeated enemy's entry is opened and its defeat counted
    events.on("defeatEnemy", (enemy) => {
      const { archiveEntryId } = getEnemyKind(enemyKindMap, enemy.enemyKindId);
      archiveProgressMap.value = openArchiveEntry(
        archiveProgressMap.value,
        ArchiveSection.LivingBeings,
        archiveEntryId,
      );
      archiveKillsMap.value = countArchiveDefeat(archiveKillsMap.value, archiveEntryId);
    });
  };
  const stop = () => {
    archiveData.value = undefined;
    archiveKillsMap.value = new Map();
    archiveProgressMap.value = new Map();
    bookReading.value = undefined;
    loadingBookId = undefined;
    viewpointPlaceMap.value = new Map();
  };
  // The viewpoints the scene group record places are offered for viewing at their places
  const offeredViewpoints = computed(() => {
    if (!archiveData.value) return [];
    return computeOfferedViewpoints(
      archiveData.value.sectionEntriesMap[ArchiveSection.Geography],
      new Set(viewpointPlaceMap.value.keys()),
    );
  });
  // A volume picked up from the world is taken straight into the Archive, which opens its entry, and is told apart from any
  // Other item by its material id: whether the item was a volume
  const takeBook = (itemId: number) => {
    const books = archiveData.value?.sectionEntriesMap[ArchiveSection.Books] ?? [];
    if (!books.some(({ materialId }) => materialId === itemId)) return false;
    archiveProgressMap.value = openArchiveBook(archiveProgressMap.value, books, itemId);
    return true;
  };
  // A viewpoint taken in at its place opens its Geography entry
  const viewViewpoint = (viewpointId: number) => {
    archiveProgressMap.value = openViewpointArchiveEntry(archiveProgressMap.value, viewpointId);
  };
  return {
    archiveData,
    archiveKillsMap,
    archiveProgressMap,
    bookReading,
    offeredViewpoints,
    readBook,
    start,
    stop,
    takeBook,
    viewpointPlaceMap,
    viewViewpoint,
  };
});
