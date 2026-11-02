<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { GameText } from "genshin-text";

import QuestScreenListSection from "#src/components/Quest/Screen/List/Section/Index.vue";
import { LIST_SCREEN_WIDTH } from "#src/services/menu/constants";
import { getQuestGroups } from "#src/services/quest/getQuestGroups";

interface Props {
  // The tab open, none for the first, which lists every quest
  category?: QuestCategory;
  // The game's words in the reader's language
  gameText: GameText;
  // How far the list is scrolled down, in units, 0 with it at its top
  listScroll: number;
  // The series the quests in progress belong to, each listing its quests under its own row, none while no series is
  // Carried
  questChapters: QuestChapter[];
  // How far each quest in progress's objective stands from the player, in metres, by quest id, for those with a place
  questDistanceMap: ReadonlyMap<string, number>;
  // The quests in progress
  quests: Quest[];
  // The quest the list has selected
  selectedQuestId: string;
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // The list's title in the reader's language
  title: string;
}

const { category, gameText, listScroll, questChapters, questDistanceMap, quests, selectedQuestId, textMap, title } =
  defineProps<Props>();
const emit = defineEmits<{ select: [questId: string] }>();
const listElement = useTemplateRef("listElement");
const questGroups = computed(() => getQuestGroups(quests, questChapters, category));
// The list is a list screen's column, LIST_SCREEN_WIDTH units wide, so its pixel width over that is a unit in pixels.
// The screen's root calls this once it has mounted, since the unit its width is in is set by the screen's own mount,
// Which runs after the list's
const scrollToListScroll = () => {
  if (listElement.value) listElement.value.scrollTop = listScroll * (listElement.value.clientWidth / LIST_SCREEN_WIDTH);
};
defineExpose({ scrollToListScroll });
</script>

<template>
  <div ref="listElement" class="list" role="tabpanel" :aria-label="title">
    <QuestScreenListSection
      v-for="{ chapters, questCategory, rowQuests } of questGroups"
      :key="questCategory"
      :chapters
      :game-text
      :quest-category
      :quest-distance-map
      :row-quests
      :selected-quest-id
      :text-map
      @select="(questId) => emit('select', questId)"
    />
  </div>
</template>
