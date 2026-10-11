<script setup lang="ts">
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { GameText } from "genshin-text";

import MenuListScreen from "#src/components/Menu/ListScreen/Index.vue";
import MenuListScreenDetail from "#src/components/Menu/ListScreen/Detail/Index.vue";
import MenuListScreenTab from "#src/components/Menu/ListScreen/Tab/Index.vue";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArchiveSectionGameTextKeyMap } from "#src/services/archive/ArchiveSectionGameTextKeyMap";
import { ArchiveSectionOrder } from "#src/services/archive/ArchiveSectionOrder";
import { QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { useEventListener } from "@vueuse/core";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The defeats of each Living Being, by its entry's id
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
const sections = ArchiveSectionOrder;
const selectedSection = ref<ArchiveSection>(ArchiveSection.Equipment);
const selectedEntries = computed(() => sectionEntriesMap[selectedSection.value]);
// An entry opens once its thing is first met, so a section's count is how many of its entries have
const openedCount = (section: ArchiveSection): number =>
  sectionEntriesMap[section].filter(({ id }) => progressMap.get(section)?.has(id)).length;
// A locked entry reads "?" in place of its name until it opens
const checkIsEntryOpened = (entryId: number): boolean => progressMap.get(selectedSection.value)?.has(entryId) ?? false;
// An opened volume of the Books section is read, so only it is a button; every other entry has nothing to read and is
// No stop on the way to one
const checkIsEntryReadable = (entryId: number): boolean =>
  selectedSection.value === ArchiveSection.Books && checkIsEntryOpened(entryId);
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
  <MenuListScreen :game-text :title="gameText[GameTextKey.Archive]" @close="emit('close')">
    <template #list>
      <div class="list" role="tablist" aria-orientation="vertical">
        <MenuListScreenTab
          v-for="section of sections"
          :key="section"
          :aria-selected="section === selectedSection"
          @click="selectedSection = section"
        >
          <span class="name">{{ gameText[ArchiveSectionGameTextKeyMap[section]] }}</span>
          <span class="count">{{ openedCount(section) }}/{{ sectionEntriesMap[section].length }}</span>
        </MenuListScreenTab>
      </div>
    </template>
    <template #detail>
      <MenuListScreenDetail :aria-label="gameText[ArchiveSectionGameTextKeyMap[selectedSection]]">
        <component
          :is="checkIsEntryReadable(entry.id) ? 'button' : 'p'"
          v-for="entry of selectedEntries"
          :key="entry.id"
          class="entry"
          :type="checkIsEntryReadable(entry.id) ? 'button' : undefined"
          :data-opened="checkIsEntryOpened(entry.id) || undefined"
          @click="checkIsEntryReadable(entry.id) && emit('readBook', entry.id)"
        >
          {{ checkIsEntryOpened(entry.id) ? textMap[entry.nameTextId] : "?" }}
          <span v-if="selectedSection === ArchiveSection.LivingBeings && checkIsEntryOpened(entry.id)" class="kills"
            >×{{ killsMap.get(entry.id) ?? 0 }}</span
          >
        </component>
      </MenuListScreenDetail>
    </template>
  </MenuListScreen>
</template>

<style scoped>
.entry {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.entry {
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30);
  background: rgb(40 50 70 / 0.72);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 30);
  text-align: start;
}

.entry[data-opened] {
  color: #e3c886;
}

.kills {
  margin-inline-start: calc(var(--unit) * 16);
}
</style>
