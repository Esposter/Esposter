import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameLanguage } from "genshin-text";
import type { ComputedRef, Ref, ShallowRef } from "vue";

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
import { getResultAsync } from "@esposter/shared";
import { z } from "zod";

// The Archive's entries, the volumes it reads and the defeats it counts. Its entries are read once the quest it opens after
// Is done, as the game opens it, and its progress and defeats are the save's, the bag's items and the defeats opening its
// Entries as they come in
export const useWorldArchive = ({
  archiveKillsMap,
  archiveProgressMap,
  enemyKindMap,
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  inventory,
  language,
  reliquaryPieceEntryMap,
  reliquarySets,
  screenKind,
}: {
  archiveKillsMap: ShallowRef<ArchiveKills>;
  archiveProgressMap: ShallowRef<ArchiveProgress>;
  enemyKindMap: ReadonlyMap<number, EnemyKind>;
  events: WorldEvents;
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  language: GameLanguage;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  reliquarySets: readonly ReliquarySetData[];
  screenKind: Ref<ScreenKind>;
}) => {
  const archiveData = shallowRef<ArchiveData>();
  // The place each viewpoint stands at, as the scene group record gives it, read with the Archive's entries
  const viewpointPlaceMap = shallowRef<ReadonlyMap<number, SceneGroupPlace>>(new Map());
  // The volume the Archive is reading, its title and its text in the reader's language
  const bookReading = shallowRef<{ body: string; title: string }>();
  // The volume last chosen whose text is still loading, let go once the Archive closes, so a text that arrives for another
  // Volume or after the Archive has closed opens no reader
  let loadingBookId: number | undefined;
  watch(screenKind, (newScreenKind) => {
    if (newScreenKind !== ScreenKind.Archive) loadingBookId = undefined;
  });
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
  // The Equipment entry of each artifact set the bag holds every piece of is opened, once the Archive's entries are read,
  // Since an artifact set opens by what the bag holds whenever it is read
  const openHeldArtifactSets = (items: readonly InventoryItem[]) => {
    if (!archiveData.value) return;
    const equipmentEntryIds = new Set(
      archiveData.value.sectionEntriesMap[ArchiveSection.Equipment].map(({ id }) => id),
    );
    archiveProgressMap.value = openArchiveArtifactSets(
      archiveProgressMap.value,
      getArchiveArtifacts(items, reliquaryPieceEntryMap),
      equipmentEntryIds,
      reliquarySets,
    );
  };
  const isArchiveUnlocked = computed(() => finishedMainQuestIds.value.has(ARCHIVE_UNLOCK_QUEST_ID));
  watch(isArchiveUnlocked, (newIsArchiveUnlocked) => {
    if (!newIsArchiveUnlocked || archiveData.value) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(async () => {
      const [sectionEntriesMap, textMap, sceneGroups] = await Promise.all([
        readArchiveEntries(gameDataBaseUrl),
        ArchiveTextLoaderMap[language](gameDataBaseUrl),
        readSceneGroups(gameDataBaseUrl),
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
        openHeldArtifactSets(inventory.value.items);
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
    archiveProgressMap.value = openArchiveEntry(archiveProgressMap.value, ArchiveSection.LivingBeings, archiveEntryId);
    archiveKillsMap.value = countArchiveDefeat(archiveKillsMap.value, archiveEntryId);
  });
  // The viewpoints the scene group record places are offered for viewing at their places
  const offeredViewpoints = computed(() => {
    if (!archiveData.value) return [];
    return computeOfferedViewpoints(
      archiveData.value.sectionEntriesMap[ArchiveSection.Geography],
      new Set(viewpointPlaceMap.value.keys()),
    );
  });
  // A viewpoint taken in at its place opens its Geography entry
  const viewViewpoint = (viewpointId: number) => {
    archiveProgressMap.value = openViewpointArchiveEntry(archiveProgressMap.value, viewpointId);
  };
  return { archiveData, bookReading, offeredViewpoints, readBook, viewpointPlaceMap, viewViewpoint };
};
