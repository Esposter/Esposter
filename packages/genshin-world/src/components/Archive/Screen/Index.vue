<script setup lang="ts">
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import ArchiveScreenCounter from "#src/components/Archive/Screen/Counter/Index.vue";
import ArchiveScreenDecoration from "#src/components/Archive/Screen/Decoration/Index.vue";
import ArchiveScreenDetail from "#src/components/Archive/Screen/Detail/Index.vue";
import ArchiveScreenFilter from "#src/components/Archive/Screen/Filter/Index.vue";
import ArchiveScreenStep from "#src/components/Archive/Screen/Step/Index.vue";
import ArchiveScreenTile from "#src/components/Archive/Screen/Tile/Index.vue";
import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { useListScreenTabStep } from "#src/composables/useListScreenTabStep";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArchiveSectionGameTextKeyMap } from "#src/services/archive/ArchiveSectionGameTextKeyMap";
import { ArchiveSectionOrder } from "#src/services/archive/ArchiveSectionOrder";
import { CloseButtonMark, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The entries drawn dimmed, by their id
  dimmedEntryIds?: ReadonlySet<number>;
  // The game's words in the reader's language
  gameText: GameText;
  // The defeats of each Living Being the Archive counts, by its entry's id
  killsMap: ArchiveKills;
  // The entries that wear a "New" badge, by their id
  newEntryIds?: ReadonlySet<number>;
  // The entries the player has met, by section
  progressMap: ArchiveProgress;
  // The Archive's entries of each section, in the codex's order
  sectionEntriesMap: Readonly<Record<ArchiveSection, readonly ArchiveEntry[]>>;
  // The entries' names and descriptions in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // Each weapon's data by its entry's id: its rarity in stars tints its tile and sets the stars the tile draws
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const {
  dimmedEntryIds = new Set<number>(),
  gameText,
  killsMap,
  newEntryIds = new Set<number>(),
  progressMap,
  sectionEntriesMap,
  textMap,
  weaponDataMap,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; readBook: [entryId: number] }>();
const selectedSection = ref<ArchiveSection>(ArchiveSection.Equipment);
// The Equipment section is its weapons, so its title names the weapons it holds, as the game's breadcrumb does
const sectionTitle = computed(() =>
  selectedSection.value === ArchiveSection.Equipment
    ? `${gameText[GameTextKey.ArchiveEquipment]} / ${gameText[GameTextKey.InventoryWeapons]}`
    : gameText[ArchiveSectionGameTextKeyMap[selectedSection.value]],
);
const selectedEntries = computed<readonly ArchiveEntry[]>(() => sectionEntriesMap[selectedSection.value]);
// The entry the detail shows is the one picked, or the section's first while none is
const selectedEntryId = ref<number>();
const selectedEntry = computed(
  () => selectedEntries.value.find(({ id }) => id === selectedEntryId.value) ?? selectedEntries.value[0],
);
// An entry opens once its thing is first met, so a section's count is how many of its entries have opened
const checkIsEntryOpened = (entryId: number): boolean => progressMap.get(selectedSection.value)?.has(entryId) ?? false;
// A locked entry reads "?" in place of its name until it opens
const getEntryName = (entry: ArchiveEntry): string =>
  checkIsEntryOpened(entry.id) ? (textMap[entry.nameTextId] ?? "") : "?";
// An open entry's description, which an entry without one (an artifact set) does not have, so its block is not drawn
const selectedDescription = computed(() => {
  const entry = selectedEntry.value;
  return entry?.descriptionTextId && checkIsEntryOpened(entry.id) ? (textMap[entry.descriptionTextId] ?? "") : "";
});
// An opened volume of the Books section is read, so only it is a button that reads; every other entry is picked
const checkIsEntryReadable = (entryId: number): boolean =>
  selectedSection.value === ArchiveSection.Books && checkIsEntryOpened(entryId);
// A Living Being's tile counts its defeats once it opens, and no other section's tile counts any
const getEntryKills = (entry: ArchiveEntry): number | undefined =>
  selectedSection.value === ArchiveSection.LivingBeings && checkIsEntryOpened(entry.id)
    ? (killsMap.get(entry.id) ?? 0)
    : undefined;
// Each weapon's rarity in stars by its entry's id, derived once from the data map this screen is given
const rarityMap = computed(
  () => new Map(Array.from(weaponDataMap, ([id, { rarity }]): [number, number] => [id, rarity])),
);
// Q, E and the arrows at the screen's edges step between the sections, held at the first and the last
const selectSection = (sectionIndex: number): void => {
  const section = ArchiveSectionOrder[sectionIndex];
  if (section) selectedSection.value = section;
};
const getSteppedSectionIndex = useListScreenTabStep(
  () => ArchiveSectionOrder.indexOf(selectedSection.value),
  () => ArchiveSectionOrder.length,
  selectSection,
);
const stepDirections = [-1, 1];
const getAdjacentSection = (step: number): ArchiveSection =>
  ArchiveSectionOrder[getSteppedSectionIndex(step)] ?? selectedSection.value;
</script>

<template>
  <!-- The game's Archive as its Equipment section's weapons draw it: the section's title across the head with the close mark, the
       count of open entries, its entries in a grid five across, each tile tinted by its rarity with its stars and name on a band,
       the "New" badges, the grid's scrollbar, the picked entry's name and lore down the right and the filter bar under the grid.
       The arrows at the screen's edges step between the sections, as Q and E do -->
  <GameScreen class="archive-screen">
    <ArchiveScreenDecoration />
    <ScreenHeader :game-text :mark="CloseButtonMark.Back" :title="sectionTitle" @close="emit('close')" />
    <ArchiveScreenCounter :game-text :progress-map />
    <div class="grid">
      <ArchiveScreenTile
        v-for="entry of selectedEntries"
        :key="entry.id"
        :game-text
        :is-dimmed="dimmedEntryIds.has(entry.id)"
        :is-new="newEntryIds.has(entry.id)"
        :is-selected="entry.id === selectedEntry?.id"
        :kills="getEntryKills(entry)"
        :name="getEntryName(entry)"
        :rarity="rarityMap.get(entry.id)"
        @click="checkIsEntryReadable(entry.id) ? emit('readBook', entry.id) : (selectedEntryId = entry.id)"
      />
    </div>
    <span class="scrollbar" aria-hidden="true" />
    <ArchiveScreenDetail
      :description="selectedDescription"
      :name="selectedEntry ? getEntryName(selectedEntry) : undefined"
    />
    <ArchiveScreenStep
      v-for="direction of stepDirections"
      :key="direction"
      :direction
      :label="gameText[ArchiveSectionGameTextKeyMap[getAdjacentSection(direction)]]"
      @click="selectSection(getSteppedSectionIndex(direction))"
    />
    <ArchiveScreenFilter :label="gameText[GameTextKey.Filter]" />
  </GameScreen>
</template>

<style scoped>
/* The title sets a point larger than the shared header's, as the Archive's breadcrumb is set in its still at 1920 by 1080 */
:deep(.title) {
  font-size: calc(var(--unit) * 28.8);
}

/* The title's and the counter's gold is outlined in black, as the game outlines its text. The counter is its own component,
   whose root takes this shadow from here beside the title's */
:deep(.title),
.counter {
  text-shadow:
    calc(var(--unit) * 1) 0 #000,
    calc(var(--unit) * -1) 0 #000,
    0 calc(var(--unit) * 1) #000,
    0 calc(var(--unit) * -1) #000;
}

/* Its marks are measured off the Archive's still at 1920 by 1080, one of its pixels a unit. The grid's top and side padding keep a
   tile's "New" badge, which stands above and to the right of its tile, inside the scrolling box */
.grid {
  position: absolute;
  box-sizing: border-box;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 136);
  display: grid;
  width: calc(var(--unit) * 641);
  height: calc(var(--unit) * 856);
  padding: calc(var(--unit) * 6) calc(var(--unit) * 4) 0;
  grid-auto-rows: calc(var(--unit) * 140);
  grid-template-columns: repeat(5, calc(var(--unit) * 115));
  align-content: start;
  column-gap: calc(var(--unit) * 14.5);
  row-gap: calc(var(--unit) * 20.9);
  overflow-y: auto;
  scrollbar-width: none;
}

/* The grid's scrollbar thumb, drawn where the still shows it at the top of the list and not moved as the grid scrolls */
.scrollbar {
  position: absolute;
  top: calc(var(--unit) * 132);
  left: calc(var(--unit) * 784);
  width: calc(var(--unit) * 6);
  height: calc(var(--unit) * 239);
  border-radius: calc(var(--unit) * 3);
  background: #bebcc3;
}
</style>
