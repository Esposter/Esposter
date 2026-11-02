<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuListScreen from "#src/components/Menu/ListScreen/Index.vue";
import QuestScreenDetail from "#src/components/Quest/Screen/Detail/Index.vue";
import QuestScreenFooter from "#src/components/Quest/Screen/Footer/Index.vue";
import QuestScreenList from "#src/components/Quest/Screen/List/Index.vue";
import QuestScreenTabs from "#src/components/Quest/Screen/Tabs/Index.vue";
import { useListScreenTabStep } from "#src/composables/useListScreenTabStep";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QUEST_CATEGORIES } from "#src/services/quest/constants";
import { QuestCategoryGameTextKeyMap } from "#src/services/quest/QuestCategoryGameTextKeyMap";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { checkIsActionKey } from "#src/services/shared/checkIsActionKey";
import { useEventListener } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { CloseButtonMark } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // How far the list is scrolled down, in units, 0 with it at its top
  listScroll?: number;
  // The series the quests in progress belong to, each listing its quests under its own row, none while no series is
  // Carried
  questChapters?: QuestChapter[];
  // How far each quest in progress's objective stands from the player, in metres, by quest id, for those with a place
  questDistanceMap: ReadonlyMap<string, number>;
  questProgressMap: ReadonlyMap<string, QuestProgress>;
  // The quests in progress
  quests: Quest[];
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // The quest being navigated to, "" with none
  trackedQuestId: string;
}

const {
  gameText,
  listScroll = 0,
  questChapters = [],
  questDistanceMap,
  questProgressMap,
  quests,
  textMap,
  trackedQuestId,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; navigate: [questId: string] }>();
const list = useTemplateRef("list");
// The tab open, none for the first, which lists every quest
const category = ref<QuestCategory>();
const selectedQuestId = ref(trackedQuestId || (quests[0]?.id ?? ""));
// Provisional: the title over a list's own tab names the list, as the first tab's names what it lists
const listTitle = computed(
  () => gameText[category.value ? QuestCategoryGameTextKeyMap[category.value] : GameTextKey.QuestsInProgress],
);
const selectedQuest = computed(() => quests.find(({ id }) => id === selectedQuestId.value));
const navigate = (questId: string) => {
  emit("navigate", questId === trackedQuestId ? "" : questId);
};
// The list's width is in the screen's unit, which the screen sets on its own mount, so the list is scrolled after it
onMounted(() => list.value?.scrollToListScroll());
// Q and E step between the tabs, the first being the list of every quest, held at the first and the last
useListScreenTabStep(
  () => (category.value ? QUEST_CATEGORIES.indexOf(category.value) + 1 : 0),
  () => QUEST_CATEGORIES.length + 1,
  (tabIndex) => {
    category.value = QUEST_CATEGORIES[tabIndex - 1];
  },
);
// F navigates to the selected quest or cancels it
useEventListener("keydown", (event) => {
  if (selectedQuest.value && checkIsActionKey(InputAction.Interact, event.code)) navigate(selectedQuest.value.id);
});
</script>

<template>
  <!-- The game's quest screen, which J opens, as the English client's still at 1920 by 1080 lays it out
       (`File:Quest Screen.png`, its places in `Layout.reference.ts`): the banner and the list's title, the tabs along
       the top, every quest in progress listed down the left under its kind's heading and a series' quests under the
       series' row, and the selected quest's title, place, journal, objective, description and rewards on the right,
       over the Quest Overview button and the one navigating to it. The world behind it is blurred and washed as the
       game lays it over the world. Not drawn: the region's art on a series' row and the journal's emblem, the reward
       items' art, and the UID -->
  <MenuListScreen is-world-blurred :game-text :mark="CloseButtonMark.Cross" :title="listTitle" @close="emit('close')">
    <template #icon>
      <MenuGlyph class="banner" :glyph="QuestGlyphMap[QuestGlyph.Banner]" />
    </template>
    <template #tabs>
      <QuestScreenTabs :category :game-text @select="(questCategory) => (category = questCategory)" />
    </template>
    <template #list>
      <QuestScreenList
        ref="list"
        :category
        :game-text
        :list-scroll
        :quest-chapters="questChapters"
        :quest-distance-map="questDistanceMap"
        :quests
        :selected-quest-id="selectedQuestId"
        :text-map="textMap"
        :title="listTitle"
        @select="(questId) => (selectedQuestId = questId)"
      />
      <span class="scroll-track" aria-hidden="true">
        <svg class="scroll-chevron up" viewBox="0 0 10 6"><path d="M1 5 5 1 9 5" /></svg>
        <svg class="scroll-chevron down" viewBox="0 0 10 6"><path d="M1 1 5 5 9 1" /></svg>
      </span>
    </template>
    <template #detail>
      <QuestScreenDetail
        v-if="selectedQuest"
        :game-text
        :quest="selectedQuest"
        :quest-chapters="questChapters"
        :quest-progress-map="questProgressMap"
        :text-map="textMap"
        :tracked-quest-id="trackedQuestId"
        @navigate="navigate"
      />
      <QuestScreenFooter :game-text />
    </template>
  </MenuListScreen>
</template>

<style scoped>
.banner {
  color: #cfbd9e;
}

/* The list's scroll bar beside its column: a light track its two chevrons end. Its thumb is not drawn: its length is the
   Game's whole list over the shown one, which the fixture does not hold */
.scroll-track {
  position: absolute;
  top: calc(var(--unit) * 127);
  left: calc(var(--unit) * 827);
  width: calc(var(--unit) * 5);
  height: calc(var(--unit) * 808);
  border-radius: calc(var(--unit) * 3);
  background: rgb(255 255 255 / 0.12);
}

.scroll-chevron {
  position: absolute;
  left: calc(var(--unit) * -3);
  width: calc(var(--unit) * 10);
  height: calc(var(--unit) * 6);
  fill: none;
  stroke: rgb(255 255 255 / 0.4);
  stroke-width: 1.2;
}

.scroll-chevron.up {
  top: calc(var(--unit) * -10);
}

.scroll-chevron.down {
  top: calc(var(--unit) * 810);
}
</style>
