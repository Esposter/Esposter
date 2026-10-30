<script setup lang="ts">
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { useListScreenTabStep } from "#src/composables/useListScreenTabStep";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArchiveSectionGameTextKeyMap } from "#src/services/archive/ArchiveSectionGameTextKeyMap";
import { ArchiveSectionOrder } from "#src/services/archive/ArchiveSectionOrder";
import { TWO_LINE_NAME_LENGTH } from "#src/services/archive/constants";
import { CloseButtonMark, GameScreen, ItemRarityFaceGradientMap } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

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
// The Archive's count is every section's open entries, which the game fills into its counter's first value
const unlockedCountSegments = computed(() =>
  splitGameTextColors(
    fillGameTextValues(
      gameText[GameTextKey.ArchiveUnlockedEntriesCount],
      [...progressMap.values()].reduce((count, entryIds) => count + entryIds.size, 0),
    ),
  ),
);
const checkIsTwoLineName = (name: string): boolean => name.length > TWO_LINE_NAME_LENGTH;
// An opened volume of the Books section is read, so only it is a button that reads; every other entry is picked
const checkIsEntryReadable = (entryId: number): boolean =>
  selectedSection.value === ArchiveSection.Books && checkIsEntryOpened(entryId);
const handleEntryClick = (entryId: number): void => {
  if (checkIsEntryReadable(entryId)) emit("readBook", entryId);
  else selectedEntryId.value = entryId;
};
// Each weapon's rarity in stars by its entry's id, derived once from the data map this screen is given
const rarityMap = computed(
  () => new Map(Array.from(weaponDataMap, ([id, { rarity }]): [number, number] => [id, rarity])),
);
// A four or five star weapon's tile takes its face gradient from the item tile, which owns the gradients.
// The two and three star tiles keep the flat tints below.
const getTileBackground = (entryId: number): string | undefined => {
  const rarity = rarityMap.value.get(entryId) ?? 0;
  return rarity >= 4 ? ItemRarityFaceGradientMap[rarity] : undefined;
};
// Q, E and the arrows at the screen's edges step between the sections, held at the first and the last
const sections = ArchiveSectionOrder;
const selectSection = (sectionIndex: number): void => {
  const section = sections[sectionIndex];
  if (section) selectedSection.value = section;
};
const getSteppedSectionIndex = useListScreenTabStep(
  () => sections.indexOf(selectedSection.value),
  () => sections.length,
  selectSection,
);
const stepDirections = [-1, 1];
const getAdjacentSection = (step: number): ArchiveSection =>
  sections[getSteppedSectionIndex(step)] ?? selectedSection.value;
</script>

<template>
  <!-- The game's Archive as its Equipment section's weapons draw it: the section's title across the head with the close mark, the
       count of open entries, its entries in a grid five across, each tile tinted by its rarity with its stars and name on a band, the
       "New" badges, the picked entry's name and lore down the right and the filter bar under the grid. The arrows at the screen's
       edges step between the sections, as Q and E do -->
  <GameScreen class="archive-screen">
    <span class="header" aria-hidden="true" />
    <svg class="crest" viewBox="0 0 132 140" aria-hidden="true">
      <circle cx="65" cy="71" r="32" fill="#615759" />
      <path
        fill="#d2c393"
        fill-rule="evenodd"
        d="M76.5 13h2l3.5 3.5q1.83 2.17 1 7l-2 5-3 3v7l9.5 5.5 4 4 7.5 2q.75 3.83-2.5 5l-7 4h-3l-3.5-2.5q.5-4-2.5-4.5l-3-1q-2.75 1.25-1.5 6.5 2 1 1 5l-3 7v3l-2 4v4l-2 3v3l-2 4v3l-2 3v3l-3 9q-3.11 8.39-9.5 13.5l-3 2h-2l-3.5-6.5v-16l1-1 1-11 2-4v-7l2-4v-4l2-5v-5l2-5 2.5-2.5 2.5-1.5 2-4q-1.5-3-7.5-1.5-1 4-7 3l-6.5-9.5v-2l3.5-2.5 2 2h12l3-1 2 1 4.5-3.5 2-3v-11l4.5-5.5 2-1zm-.5 5-2 2q-1 3 2 4l2-1q3 1 1-3 0-2-3-2zm-27 25v3h1l2-2-3-1zm18 12q-3 4-8 5v6l1 1v6q-2 1-1 6l-1 1v6l-2 5v4l-1 1 1 6v-4l3-4 2-11 5-13 4-4h1v-3l-2-2q1-4-1-4 1-3-1-2z M60.5 21q6.25-1.25 7.5 2.5v2l-2 4.5-2.5 1h-3l-1 1h-7l-1 1h-10l-3.5 3.5-1 6-9 11-1 3v6l3 8-3 5v8l4 6v2l4.5 5.5 2.5 1.5 4 6v7.5h-2.5l-5-3-9.5-9.5-4-6-4-9q1-4-1-5v-19q2-1 1-5l2-2 2-6 8.5-11.5q7.04-6.96 17-11h2l3-2 8-1 1-1z M85.5 27h3l9 6 6.5 6.5 6 9 3 7 1 8 1 1v12l-1 1-2 10-4 8-13.5 14.5-14 7-8 1-1 1h-8q-3.25-1.75.5-3.5l5.5-6.5h3l1-1h3l6-2 3-3 4-1 4.5-3.5 4-5v-2l4.5-7.5q3 .87 1.5-3.5l-1-1v-5l-2-3v-2l3-9-1-1v-6q1.75-.75 1-4l-4.5-3.5h-2l-5-4h-1.5l-1.5-3h-2l-3-3q-3 .5-3.5-1.5.45-5.55 4.5-7.5z M87.5 65l.5 1.5-1 2.5q-3.33 1.13-2-3l2.5-1z M87.5 79l2.5 3.5-4.5 2.5-1.5-3 4-.5q-1.75-.75-.5-2.5z M84.5 88h1.5v3q-3-1.25-2 2.5-.5 2-3.5 1.5l-.5-.5 3-3q-.5-3 1.5-3.5z M74.5 96q2.5 1 1 2l-2.5-.5 1.5-1.5z"
      />
    </svg>
    <svg class="tab" viewBox="0 0 132 140" aria-hidden="true">
      <circle cx="64" cy="68" r="63" fill="#53575b" />
      <path
        fill="#e9e7d5"
        fill-rule="evenodd"
        d="M58.5 5h12l1 1 9 1 9 3 9 5 7 6h1.5v1.5l11 12 5 9 3 9 1 8 1 1v13l-1 1-1 9-5 13-5 8-9.5 10.5-8 6-12 6-6 2-9 1-1 1h-12l-5-2h-5l-15-6-15.5-12.5-5-6-6-10v-2l-4-9v-5l-1-1v-4.5l-2-.5v-11.5q3.67 1.35 2-4.5l1-1v-4l2-6 4-9 7-10 6.5-6.5 15-10h2l9-4h4l6-2zm42.5 19-4 5v4l-15 12-4 2-4-2-4-7h-3l-5 4 7 8v3l-6 6h-2v2l-8 8q-3-1-2 2h-2v2l-11 11h-2v2l-5 5-3 5-3 6-2 8 9-2 6-4h2l25-24h1q-1-3 3-4 2 1 1-1l3-2 8-9h3l8 7q4-2 3-9l-5-1-3-3v-5l9-10 3-4v-2l8-2q3-1 2-7l-3-4h-5zm-40 6-1 1h-6l-1 1h-11l-1 1h-6q-1 2-4 1v28l-1 1v9l1 1 1 7 2 1 8-7 11-12q2 1 1-2h2v-1l6-6v-2l-5-5q-1-5 1-7l7-5q6-1 10 1 3 1 2 6h2q1-3 6-4l2-3-1-2h-8l-6-2h-11zm35 22-3 3v3h5v-6h-2zm-14 20-5 5q-3-1-2 2l-13 12-11 12 7 5 7 3 12-6 9-7 8-10 4-10v-4l-2 2-5 2-3-1-6-5z"
      />
    </svg>
    <span class="underline" aria-hidden="true" />
    <svg class="diamond" viewBox="0 0 104 132" aria-hidden="true">
      <path
        fill="#d3d0c4"
        fill-rule="evenodd"
        d="M51.5 7q3-.5 3.5 1.5l6.5 7.5 3.5 2.5q.5 3-1.5 3.5l-4.5 3.5 2.5 2.5h3l8 4 7.5 6.5 4 5q4.02 5.98 5 15l5 7-6 4q-2.49 15.51-13.5 22.5l-7 4h-8l-2-2-.5.5v4.5h3.5l2-1 2.5 1v1.5l-8 9-3 10-1.5 1.5-2.5-3.5v-3l-4-8-6-7q.5-2 3.5-1.5l3 1q2.25-.75 1.5-4.5l-.5-.5-2 2h-8l-8-5-4.5-4.5-7-12v-4l-2.5-2.5h-2l-3.5-2.5 1-2.5 3-1.5 4-7v-3l3-5v-2l9.5-10.5 6-4 7-2 1.5-1.5q.5-3-1.5-3.5l-3.5-2.5q-.5-4 2.5-4.5l7.5-6.5 1.5-2.5zm-1.5 32v7l-5 8-6 5-4 2h-4l-2 3 2 1 9 3 4 3 5 7 2 8 3 1 1-6 4-6q-1-3 2-2v-2l15-7q2 1 1-1l-1-2-7-1-3-2-9-9-2-4v-4q-1-3-5-2z"
      />
    </svg>
    <ScreenHeader :game-text :mark="CloseButtonMark.Back" :title="sectionTitle" @close="emit('close')" />
    <p class="counter">
      <span>{{ gameText[GameTextKey.ArchiveUnlockedEntries] }}</span>
      <span class="count"
        ><span v-for="({ color, text }, index) of unlockedCountSegments" :key="index" :style="{ color }">{{
          text
        }}</span></span
      >
    </p>
    <div class="grid">
      <button
        v-for="entry of selectedEntries"
        :key="entry.id"
        class="tile"
        type="button"
        :aria-pressed="entry.id === selectedEntry?.id"
        :data-dimmed="dimmedEntryIds.has(entry.id) || undefined"
        :data-rarity="rarityMap.get(entry.id)"
        :style="{ background: getTileBackground(entry.id) }"
        @click="handleEntryClick(entry.id)"
      >
        <span class="name" :data-two-lines="checkIsTwoLineName(getEntryName(entry)) || undefined">
          <span class="label">{{ getEntryName(entry) }}</span>
          <span v-if="selectedSection === ArchiveSection.LivingBeings && checkIsEntryOpened(entry.id)" class="kills"
            >×{{ killsMap.get(entry.id) ?? 0 }}</span
          >
        </span>
        <span class="stars" aria-hidden="true"
          ><span v-for="star in rarityMap.get(entry.id) ?? 0" :key="star" class="star"
        /></span>
        <span v-if="newEntryIds.has(entry.id)" class="new">{{ gameText[GameTextKey.New] }}</span>
      </button>
    </div>
    <p v-if="selectedEntry" class="detail-name">{{ getEntryName(selectedEntry) }}</p>
    <template v-if="selectedDescription">
      <span class="separator" aria-hidden="true" />
      <span class="book" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#2b2f3a" stroke-width="2">
          <path d="M2 6Q7 3.5 12 6Q17 3.5 22 6V19Q17 16.5 12 19Q7 16.5 2 19Z M12 6V19" />
        </svg>
      </span>
      <p class="description">{{ selectedDescription }}</p>
    </template>
    <button
      v-for="step of stepDirections"
      :key="step"
      class="step"
      type="button"
      :data-step="step"
      :aria-label="gameText[ArchiveSectionGameTextKeyMap[getAdjacentSection(step)]]"
      @click="selectSection(getSteppedSectionIndex(step))"
    >
      <svg viewBox="0 0 46 64">
        <polygon fill="#f2ecd9" points="30,11 7,32 30,53 30,42 20,32 30,23" />
        <polygon fill="#7b8599" points="29,23 38,32 29,41 20,32" />
        <polygon fill="#232b40" points="29,28 33,32 29,36 25,32" />
      </svg>
    </button>
    <span class="filter" aria-hidden="true">
      <svg class="filter-icon" viewBox="0 0 22 24">
        <polygon fill="#3f3d4b" points="0,0 22,0 14,11 14,24 8,20 8,11" />
      </svg>
      <span class="filter-label">{{ gameText[GameTextKey.Filter] }}</span>
      <svg class="filter-caret" viewBox="0 0 15 8">
        <polygon fill="#3d3c48" points="0,0 15,0 7.5,8" />
      </svg>
    </span>
  </GameScreen>
</template>

<style scoped>
/* The title sets a point larger than the shared header's, as the Archive's breadcrumb is set in its still at 1920 by 1080 */
:deep(.title) {
  font-size: calc(var(--unit) * 28.8);
}

/* The title's and the counter's gold is outlined in black, as the game outlines its text */
:deep(.title),
.counter {
  text-shadow:
    calc(var(--unit) * 1) 0 #000,
    calc(var(--unit) * -1) 0 #000,
    0 calc(var(--unit) * 1) #000,
    0 calc(var(--unit) * -1) #000;
}

/* The dark header the title and the counter sit on, measured across the still's top 95 pixels, darker to the right */
.header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 95);
  background: linear-gradient(to right, #14182d, #0c1124);
}

/* The header's marks, traced from the still at two of its pixels a unit (the viewBox), each at its own pixel's place */
.crest {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 44);
  width: calc(var(--unit) * 66);
  height: calc(var(--unit) * 70);
}

.tab {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 880);
  width: calc(var(--unit) * 66);
  height: calc(var(--unit) * 70);
}

.diamond {
  position: absolute;
  top: calc(var(--unit) * 16);
  left: calc(var(--unit) * 982);
  width: calc(var(--unit) * 52);
  height: calc(var(--unit) * 66);
}

/* The active tab's gold mark, under its icon */
.underline {
  position: absolute;
  top: calc(var(--unit) * 92);
  left: calc(var(--unit) * 864);
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 4);
  background: #d6c28d;
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
  height: calc(var(--unit) * 865);
  padding: calc(var(--unit) * 6) calc(var(--unit) * 4) 0;
  grid-auto-rows: calc(var(--unit) * 140);
  grid-template-columns: repeat(5, calc(var(--unit) * 115));
  align-content: start;
  column-gap: calc(var(--unit) * 14.5);
  row-gap: calc(var(--unit) * 20.9);
  overflow-y: auto;
  scrollbar-width: none;
}

.tile {
  position: relative;
  display: flex;
  margin: 0;
  padding: 0;
  border: none;
  background: #595d67;
  color: inherit;
  cursor: inherit;
  font: inherit;
  align-items: end;
}

.tile[data-rarity="2"] {
  background: #486b66;
}

.tile[data-rarity="3"] {
  background: #4f6386;
}

.tile[data-dimmed] {
  filter: brightness(0.5);
}

.tile:hover,
.tile[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid #f4f7ff;
}

.name {
  display: flex;
  width: 100%;
  height: calc(var(--unit) * 29);
  padding: 0 calc(var(--unit) * 4);
  background: #e5e4dd;
  color: #2b2f3a;
  font-size: calc(var(--unit) * 17.5);
  font-weight: 600;
  line-height: calc(var(--unit) * 15);
  text-align: center;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

/* A two-line name is set at the game's cap height, letter-spaced to its width */
.name[data-two-lines] {
  font-size: calc(var(--unit) * 16);
  line-height: calc(var(--unit) * 14);
  letter-spacing: calc(var(--unit) * 1.1);
}

/* Set under the game's cap height, as its face is wider than Signika there, so a single line is letter-spaced to its width */
.name:not([data-two-lines]) .label {
  letter-spacing: calc(var(--unit) * 1.6);
  white-space: nowrap;
}

.name[data-two-lines] .label {
  max-width: calc(var(--unit) * 100);
  text-wrap: balance;
}

.kills {
  margin-inline-start: calc(var(--unit) * 8);
}

/* The stars sit centred on the band's top edge, one for each of the weapon's stars */
.stars {
  position: absolute;
  top: calc(var(--unit) * 96);
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  gap: calc(var(--unit));
}

.star {
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 18);
  background: #fbcd3f;
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

/* A badge stands on its tile's top-right corner, with a sparkle at each of its two corners that reach past it */
.new {
  position: absolute;
  top: calc(var(--unit) * -4);
  left: calc(var(--unit) * 49);
  width: calc(var(--unit) * 68);
  height: calc(var(--unit) * 31);
  border-radius: calc(var(--unit) * 4);
  background: linear-gradient(#e9b24c, #c8851f);
  color: #fffb6a;
  font-size: calc(var(--unit) * 23);
  font-weight: 700;
  line-height: calc(var(--unit) * 31);
  text-align: center;
}

.new::before,
.new::after {
  position: absolute;
  width: calc(var(--unit) * 12);
  height: calc(var(--unit) * 12);
  background: #fdd65a;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.new::before {
  top: calc(var(--unit) * -5);
  right: calc(var(--unit) * -4);
}

.new::after {
  top: calc(var(--unit) * 25);
  left: calc(var(--unit) * -6);
}

.counter {
  position: absolute;
  top: calc(var(--unit) * 31);
  right: calc(var(--unit) * 140);
  margin: 0;
  color: #d3c79f;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 0.4);
  white-space: nowrap;
}

.count {
  color: #e6e6e0;
}

.detail-name {
  position: absolute;
  top: calc(var(--unit) * 841);
  right: calc(var(--unit) * 115);
  margin: 0;
  color: #d5c08f;
  font-size: calc(var(--unit) * 42);
  font-weight: 600;
  line-height: calc(var(--unit) * 52);
  letter-spacing: calc(var(--unit) * 1.6);
  white-space: nowrap;
}

/* The picked entry's lore sits under a rule, beside a round book mark, in the game's grey */
.separator {
  position: absolute;
  top: calc(var(--unit) * 888);
  left: calc(var(--unit) * 1388);
  width: calc(var(--unit) * 480);
  height: calc(var(--unit) * 2);
  background: #434c63;
}

.book {
  position: absolute;
  top: calc(var(--unit) * 840);
  left: calc(var(--unit) * 1813);
  display: flex;
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  border-radius: 50%;
  background: #e8e5dc;
  align-items: center;
  justify-content: center;
}

.book svg {
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
}

.description {
  position: absolute;
  top: calc(var(--unit) * 898);
  left: calc(var(--unit) * 1390);
  width: calc(var(--unit) * 480);
  margin: 0;
  color: #9ea7bf;
  font-size: calc(var(--unit) * 25);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 0.6);
}

/* Each arrow sits at the screen's middle edge, the next one mirrored from the previous */
.step {
  position: absolute;
  top: calc(var(--unit) * 508);
  width: calc(var(--unit) * 46);
  height: calc(var(--unit) * 64);
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.step[data-step="-1"] {
  left: calc(var(--unit) * 52);
}

.step[data-step="1"] {
  right: calc(var(--unit) * 52);
}

.step[data-step="1"] svg {
  transform: scaleX(-1);
}

.step svg {
  width: 100%;
  height: 100%;
}

.filter {
  position: absolute;
  top: calc(var(--unit) * 995);
  left: calc(var(--unit) * 140);
  width: calc(var(--unit) * 631);
  height: calc(var(--unit) * 49);
  border-radius: calc(var(--unit) * 25);
  background: #ebe5d6;
}

.filter-icon {
  position: absolute;
  top: calc(var(--unit) * 13);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 24);
}

.filter-label {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 49);
  color: #2e2f3b;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 49);
  white-space: nowrap;
}

.filter-caret {
  position: absolute;
  top: calc(var(--unit) * 21);
  left: calc(var(--unit) * 597);
  width: calc(var(--unit) * 15);
  height: calc(var(--unit) * 8);
}
</style>
