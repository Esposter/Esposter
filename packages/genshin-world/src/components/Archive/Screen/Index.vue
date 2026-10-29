<script setup lang="ts">
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArchiveSectionGameTextKeyMap } from "#src/services/archive/ArchiveSectionGameTextKeyMap";
import { ArchiveSectionOrder } from "#src/services/archive/ArchiveSectionOrder";
import { QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { useEventListener } from "@vueuse/core";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Each weapon's rarity in stars by its entry's id, which tints its tile; without it every tile draws as a one-star tile
  rarityMap?: ReadonlyMap<number, number>;
  // The defeats of each Living Being the Archive counts, by its entry's id
  killsMap: ArchiveKills;
  // The entries the player has met, by section
  progressMap: ArchiveProgress;
  // The Archive's entries of each section, in the codex's order
  sectionEntriesMap: Readonly<Record<ArchiveSection, readonly ArchiveEntry[]>>;
  // The entries' names in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { gameText, progressMap, sectionEntriesMap, textMap } = defineProps<Props>();
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
// An entry opens once its thing is first met, so a section's count is how many of its entries have
const checkIsEntryOpened = (entryId: number): boolean => progressMap.get(selectedSection.value)?.has(entryId) ?? false;
// A locked entry reads "?" in place of its name until it opens
const getEntryName = (entry: ArchiveEntry): string =>
  checkIsEntryOpened(entry.id) ? (textMap[entry.nameTextId] ?? "") : "?";
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
// Q and E step between the sections, held at the first and the last
const sections = ArchiveSectionOrder;
useEventListener("keydown", (event) => {
  if (event.code !== QUEST_TAB_PREVIOUS_CODE && event.code !== QUEST_TAB_NEXT_CODE) return;
  const step = event.code === QUEST_TAB_NEXT_CODE ? 1 : -1;
  const sectionIndex = sections.indexOf(selectedSection.value);
  const nextSection = sections[Math.min(Math.max(sectionIndex + step, 0), sections.length - 1)];
  if (nextSection) selectedSection.value = nextSection;
});
</script>

<template>
  <!-- The game's Archive as its Equipment section's weapons draw it: the section's title across the head with the close mark, its
       entries in a grid five across, each tile tinted by its rarity with its name on a band, the picked entry's name down the right
       and the filter bar under the grid. Not yet drawn: the entries' art, the words the game text has no key for (the count, the
       filter, the descriptions) and the "New" badges, which an entry does not hold a state for. Q and E step between the sections -->
  <GameScreen class="archive-screen">
    <ScreenHeader :game-text :title="sectionTitle" @close="emit('close')" />
    <div class="grid">
      <button
        v-for="entry of selectedEntries"
        :key="entry.id"
        class="tile"
        type="button"
        :aria-pressed="entry.id === selectedEntry?.id"
        :data-rarity="rarityMap?.get(entry.id)"
        @click="handleEntryClick(entry.id)"
      >
        <span class="name" :data-two-lines="checkIsTwoLineName(getEntryName(entry)) || undefined">
          <span class="label">{{ getEntryName(entry) }}</span>
          <span v-if="selectedSection === ArchiveSection.LivingBeings && checkIsEntryOpened(entry.id)" class="kills"
            >×{{ killsMap.get(entry.id) ?? 0 }}</span
          >
        </span>
      </button>
    </div>
    <p v-if="selectedEntry" class="detail-name">{{ getEntryName(selectedEntry) }}</p>
    <span class="filter" aria-hidden="true" />
  </GameScreen>
</template>

<style scoped>
/* The title sets a point larger than the shared header's, as the Archive's breadcrumb is set in its still at 1920 by 1080 */
:deep(.title) {
  font-size: calc(var(--unit) * 28.8);
}

/* Its marks are measured off the Archive's still at 1920 by 1080, one of its pixels a unit */
.grid {
  position: absolute;
  top: calc(var(--unit) * 126);
  left: calc(var(--unit) * 140);
  display: grid;
  width: calc(var(--unit) * 633);
  height: calc(var(--unit) * 859);
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
  background: #666a74;
  color: inherit;
  cursor: inherit;
  font: inherit;
  align-items: end;
}

.tile[data-rarity="2"] {
  background: #4b7269;
}

.tile[data-rarity="3"] {
  background: #4f6a8f;
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
  font-size: calc(var(--unit) * 15);
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

.filter {
  position: absolute;
  top: calc(var(--unit) * 995);
  left: calc(var(--unit) * 140);
  width: calc(var(--unit) * 631);
  height: calc(var(--unit) * 49);
  border-radius: calc(var(--unit) * 25);
  background: #ebe5d6;
}
</style>
