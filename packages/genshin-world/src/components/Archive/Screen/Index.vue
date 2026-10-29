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
import { GameScreen, ItemRarityFaceGradientMap } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The defeats of each Living Being the Archive counts, by its entry's id
  killsMap: ArchiveKills;
  // The entries the player has met, by section
  progressMap: ArchiveProgress;
  // The Archive's entries of each section, in the codex's order
  sectionEntriesMap: Readonly<Record<ArchiveSection, readonly ArchiveEntry[]>>;
  // The entries drawn dimmed, by their id
  dimmedEntryIds?: ReadonlySet<number>;
  // The entries that wear a "New" badge, by their id
  newEntryIds?: ReadonlySet<number>;
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
  return entry?.descriptionTextId && checkIsEntryOpened(entry.id) ? textMap[entry.descriptionTextId] : undefined;
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
// A name longer than this many characters sets in two smaller lines on its tile, as the game fits a long name to its band
const TWO_LINE_NAME_LENGTH = 12;
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
// A four or five star weapon's tile takes its face gradient from the item tile, which owns the gradients, while the two and
// three star tiles keep the flat tints below
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
    <ScreenHeader :game-text :title="sectionTitle" @close="emit('close')" />
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
  font-size: calc(var(--unit) * 18);
  font-weight: 600;
  line-height: calc(var(--unit) * 15);
  text-align: center;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

.name[data-two-lines] {
  font-size: calc(var(--unit) * 14);
  line-height: calc(var(--unit) * 15);
}

.name:not([data-two-lines]) .label {
  white-space: nowrap;
}

.name[data-two-lines] .label {
  max-width: calc(var(--unit) * 84);
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
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
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
  top: calc(var(--unit) * 32);
  right: calc(var(--unit) * 136);
  margin: 0;
  color: #d3c79f;
  font-size: calc(var(--unit) * 23);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
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
  font-size: calc(var(--unit) * 46);
  font-weight: 600;
  line-height: calc(var(--unit) * 52);
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
  background: #ece5cf;
  align-items: center;
  justify-content: center;
}

.book svg {
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
}

.description {
  position: absolute;
  top: calc(var(--unit) * 898);
  left: calc(var(--unit) * 1390);
  width: calc(var(--unit) * 468);
  margin: 0;
  color: #9ea7bf;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 25);
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
