<script setup lang="ts">
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { GameText } from "genshin-text";

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
  // The entries the player has met, by section
  progressMap: ArchiveProgress;
  // The Archive's entries of each section, in the codex's order
  sectionEntriesMap: Readonly<Record<ArchiveSection, readonly ArchiveEntry[]>>;
  // The entries' names in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { gameText, progressMap, sectionEntriesMap, textMap } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const sections = ArchiveSectionOrder;
const selectedSection = ref<ArchiveSection>(ArchiveSection.Equipment);
const selectedEntries = computed(() => sectionEntriesMap[selectedSection.value]);
// An entry opens once its thing is first met, so a section's count is how many of its entries have
const openedCount = (section: ArchiveSection): number =>
  sectionEntriesMap[section].filter(({ id }) => progressMap.get(section)?.has(id)).length;
// A locked entry reads "?" in place of its name until it opens
const checkIsEntryOpened = (entryId: number): boolean => progressMap.get(selectedSection.value)?.has(entryId) ?? false;
// Q and E step between the sections, held at the first and the last
useEventListener("keydown", (event) => {
  if (event.code !== QUEST_TAB_PREVIOUS_CODE && event.code !== QUEST_TAB_NEXT_CODE) return;
  const step = event.code === QUEST_TAB_NEXT_CODE ? 1 : -1;
  const sectionIndex = sections.indexOf(selectedSection.value);
  const nextSection = sections[Math.min(Math.max(sectionIndex + step, 0), sections.length - 1)];
  if (nextSection) selectedSection.value = nextSection;
});
</script>

<template>
  <!-- The game's Archive, which the Paimon menu opens once its quest is done: its seven sections down the left, each with
       How many of its entries are opened, and the selected section's entries on the right, each a name or a "?" until it
       Opens. Not yet built: the entries' pictures, their descriptions and the look the English client draws -->
  <GameScreen class="archive-screen">
    <p class="header-title">{{ gameText[GameTextKey.Archive] }}</p>
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <div class="sections" role="tablist" aria-orientation="vertical">
      <button
        v-for="section of sections"
        :key="section"
        class="section"
        :aria-selected="section === selectedSection"
        role="tab"
        type="button"
        @click="selectedSection = section"
      >
        <span class="name">{{ gameText[ArchiveSectionGameTextKeyMap[section]] }}</span>
        <span class="count">{{ openedCount(section) }}/{{ sectionEntriesMap[section].length }}</span>
      </button>
    </div>
    <div class="entries" role="tabpanel" :aria-label="gameText[ArchiveSectionGameTextKeyMap[selectedSection]]">
      <p
        v-for="entry of selectedEntries"
        :key="entry.id"
        class="entry"
        :data-opened="checkIsEntryOpened(entry.id) || undefined"
      >
        {{ checkIsEntryOpened(entry.id) ? textMap[entry.nameTextId] : "?" }}
      </p>
    </div>
  </GameScreen>
</template>

<style scoped>
.archive-screen {
  color: #fff;
}

.header-title,
.section,
.close,
.entry {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.header-title {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 144);
  height: calc(var(--unit) * 95);
  color: #d7c28f;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 95);
}

.key {
  position: absolute;
  top: calc(var(--unit) * 33);
  display: grid;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 28);
  background: #ece5d8;
  color: #000;
  font-size: calc(var(--unit) * 20);
  place-items: center;
}

.key.previous {
  left: calc(var(--unit) * 675);
}

.key.next {
  left: calc(var(--unit) * 1213);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 50);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: calc(var(--unit) * 6);
  background: rgb(236 229 216 / 0.85);
  color: #3b4255;
  font-size: calc(var(--unit) * 40);
  line-height: 1;
}

.sections {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 150);
  display: flex;
  width: calc(var(--unit) * 666);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

.section {
  display: flex;
  height: calc(var(--unit) * 76);
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30) 0;
  background: rgb(40 50 70 / 0.72);
  color: inherit;
  font-size: calc(var(--unit) * 24);
  justify-content: space-between;
  text-align: start;
}

.section[aria-selected="true"] {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}

.entries {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 877);
  display: flex;
  width: calc(var(--unit) * 899);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

.entry {
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30);
  background: rgb(40 50 70 / 0.72);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 30);
}

.entry[data-opened] {
  color: #e3c886;
}
</style>
