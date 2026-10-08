<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GameText } from "genshin-text";

import { QUEST_CATEGORIES, QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { QuestCategoryGameTextKeyMap } from "#src/services/quest/QuestCategoryGameTextKeyMap";
import { QuestKindCategoryMap } from "#src/services/quest/QuestKindCategoryMap";
import { checkIsActionKey } from "#src/services/shared/checkIsActionKey";
import { useEventListener } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  questProgressMap: ReadonlyMap<string, QuestProgress>;
  // The quests in progress
  quests: Quest[];
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // The quest being navigated to, "" with none
  trackedQuestId: string;
}

const { gameText, questProgressMap, quests, textMap, trackedQuestId } = defineProps<Props>();
const emit = defineEmits<{ close: []; navigate: [questId: string] }>();
// The tab open, none for the first, which lists every quest
const category = ref<QuestCategory>();
const selectedQuestId = ref(trackedQuestId || (quests[0]?.id ?? ""));
const questGroups = computed(() =>
  (category.value ? [category.value] : QUEST_CATEGORIES)
    .map((questCategory) => ({
      categoryQuests: quests.filter(({ kind }) => QuestKindCategoryMap[kind] === questCategory),
      questCategory,
    }))
    .filter(({ categoryQuests }) => categoryQuests.length > 0),
);
const selectedQuest = computed(() => quests.find(({ id }) => id === selectedQuestId.value));
// The selected quest's step, and how far its first counted objective has come
const questStep = computed(() => {
  if (!selectedQuest.value) return undefined;
  const { objectiveCounts, stepIndex } = questProgressMap.get(selectedQuest.value.id) ?? {
    objectiveCounts: [],
    stepIndex: 0,
  };
  const step = selectedQuest.value.steps[stepIndex];
  if (!step) return undefined;
  return { counter: getQuestCounter(step, objectiveCounts), textId: step.textId };
});
const navigate = (questId: string) => {
  emit("navigate", questId === trackedQuestId ? "" : questId);
};
// Q and E step between the tabs, held at the first and the last, and F navigates to the selected quest or cancels it
useEventListener("keydown", (event) => {
  const tabIndex = category.value ? QUEST_CATEGORIES.indexOf(category.value) + 1 : 0;
  if (event.code === QUEST_TAB_PREVIOUS_CODE || event.code === QUEST_TAB_NEXT_CODE) {
    const step = event.code === QUEST_TAB_NEXT_CODE ? 1 : -1;
    const newTabIndex = Math.min(Math.max(tabIndex + step, 0), QUEST_CATEGORIES.length);
    category.value = QUEST_CATEGORIES[newTabIndex - 1];
  } else if (selectedQuest.value && checkIsActionKey(InputAction.Interact, event.code))
    navigate(selectedQuest.value.id);
});
</script>

<template>
  <!-- The game's quest screen, which J opens: its tabs along the top, every quest in progress listed down the left under
       Its kind's heading, and the selected one's title, step and description on the right over the button that
       Navigates to it. The game lays it over the world, blurred, so the parity page draws the reference's frame behind
       It and scores only what the screen draws. Not yet built: the tabs' glyphs (a diamond stands in for each until
       Traced), the quest kind and place marks, each quest's distance, the rewards row, the overview button and the UID -->
  <GameScreen class="quest-screen">
    <p class="header-title">{{ gameText[GameTextKey.Quests] }}</p>
    <div class="tabs" role="tablist">
      <button
        class="tab"
        :aria-label="gameText[GameTextKey.Quests]"
        :aria-selected="!category"
        role="tab"
        type="button"
        @click="category = undefined"
      >
        <span class="glyph" />
      </button>
      <button
        v-for="questCategory of QUEST_CATEGORIES"
        :key="questCategory"
        class="tab"
        :aria-label="gameText[QuestCategoryGameTextKeyMap[questCategory]]"
        :aria-selected="category === questCategory"
        role="tab"
        type="button"
        @click="category = questCategory"
      >
        <span class="glyph" />
      </button>
    </div>
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <div
      class="list"
      :aria-label="gameText[category ? QuestCategoryGameTextKeyMap[category] : GameTextKey.Quests]"
      role="tabpanel"
    >
      <section v-for="{ categoryQuests, questCategory } of questGroups" :key="questCategory">
        <p class="heading" role="heading" aria-level="2">{{ gameText[QuestCategoryGameTextKeyMap[questCategory]] }}</p>
        <button
          v-for="{ id, titleTextId } of categoryQuests"
          :key="id"
          class="quest"
          :class="{ selected: id === selectedQuestId, tracked: id === trackedQuestId }"
          type="button"
          @click="selectedQuestId = id"
        >
          {{ textMap[titleTextId] }}
        </button>
      </section>
    </div>
    <div v-if="selectedQuest" class="details">
      <p class="title" role="heading" aria-level="1">{{ textMap[selectedQuest.titleTextId] }}</p>
      <p v-if="questStep" class="step">
        <span>{{ textMap[questStep.textId] }}</span>
        <span>{{ questStep.counter }}</span>
      </p>
      <p class="description">{{ textMap[selectedQuest.descriptionTextId] }}</p>
      <button class="navigate" type="button" @click="navigate(selectedQuest.id)">
        {{
          gameText[selectedQuest.id === trackedQuestId ? GameTextKey.QuestCancelNavigation : GameTextKey.QuestNavigate]
        }}
      </button>
    </div>
  </GameScreen>
</template>

<style scoped>
.quest-screen {
  color: #fff;
}

.header-title,
.tab,
.close,
.quest,
.navigate {
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

.tabs {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 720);
  display: flex;
  height: calc(var(--unit) * 95);
}

.tab {
  position: relative;
  display: grid;
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 95);
  background: none;
  place-items: center;
}

.glyph {
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  border: calc(var(--unit) * 4) solid rgb(236 229 216 / 0.7);
  transform: rotate(45deg);
}

.tab[aria-selected="true"]::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--unit) * 5);
  background: #d7c28f;
  content: "";
}

.tab[aria-selected="true"] .glyph {
  border-color: #ece5d8;
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

.list {
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

.heading {
  height: calc(var(--unit) * 50);
  margin: calc(var(--unit) * 4) 0 0;
  padding-left: calc(var(--unit) * 45);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 50);
}

.quest {
  display: block;
  width: 100%;
  height: calc(var(--unit) * 76);
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30) 0;
  background: rgb(40 50 70 / 0.72);
  color: inherit;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 26);
  text-align: start;
}

.quest.selected {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}

.quest.tracked {
  color: #e3c886;
}

.details {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 877);
  width: calc(var(--unit) * 899);
}

.title {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: 0;
  right: 0;
  margin: 0;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  line-height: calc(var(--unit) * 40);
}

.step {
  position: absolute;
  top: calc(var(--unit) * 241);
  left: 0;
  right: 0;
  display: flex;
  height: calc(var(--unit) * 56);
  margin: 0;
  padding: 0 calc(var(--unit) * 14) 0 calc(var(--unit) * 53);
  background: rgb(255 255 255 / 0.15);
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  justify-content: space-between;
  align-items: center;
}

.description {
  position: absolute;
  top: calc(var(--unit) * 315);
  left: 0;
  right: 0;
  margin: 0;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 29);
}

.navigate {
  position: absolute;
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 635);
  display: grid;
  width: calc(var(--unit) * 288);
  height: calc(var(--unit) * 62);
  border: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.6);
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.2);
  color: #fff;
  font-size: calc(var(--unit) * 28);
  line-height: calc(var(--unit) * 30);
  place-items: center;
}
</style>
