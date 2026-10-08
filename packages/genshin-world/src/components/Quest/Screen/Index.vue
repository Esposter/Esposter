<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GameText } from "genshin-text";

import { QUEST_CATEGORIES, QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
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
// The selected quest's step, and how far its first counted objective has come, as the game shows "(0/3)" after it
const questStep = computed(() => {
  if (!selectedQuest.value) return undefined;
  const { objectiveCounts, stepIndex } = questProgressMap.get(selectedQuest.value.id) ?? {
    objectiveCounts: [],
    stepIndex: 0,
  };
  const step = selectedQuest.value.steps[stepIndex];
  if (!step) return undefined;
  const countedIndex = step.objectives.findIndex(({ count }) => count > 1);
  const counted = step.objectives[countedIndex];
  return { counter: counted ? `(${objectiveCounts[countedIndex] ?? 0}/${counted.count})` : "", textId: step.textId };
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
       Navigates to it. Provisional: the tabs' glyphs, sizes, places and colours wait on the parity pass against the
       Wiki's screenshot of the English client's -->
  <GameScreen class="quest-screen">
    <div class="header">
      <div class="tabs" role="tablist">
        <button class="tab" :aria-selected="!category" role="tab" type="button" @click="category = undefined">
          {{ gameText[GameTextKey.Quests] }}
        </button>
        <button
          v-for="questCategory of QUEST_CATEGORIES"
          :key="questCategory"
          class="tab"
          :aria-selected="category === questCategory"
          role="tab"
          type="button"
          @click="category = questCategory"
        >
          {{ gameText[QuestCategoryGameTextKeyMap[questCategory]] }}
        </button>
      </div>
      <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    </div>
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
  background: linear-gradient(rgb(28 33 54 / 0.92), rgb(46 51 79 / 0.92));
  color: #ece5d8;
}

.header {
  position: absolute;
  inset: 0 0 auto;
  display: flex;
  height: calc(var(--unit) * 92);
  align-items: center;
  justify-content: center;
}

.tabs {
  display: flex;
  gap: calc(var(--unit) * 24);
}

.tab,
.close,
.quest,
.navigate {
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.tab {
  padding: calc(var(--unit) * 8) calc(var(--unit) * 16);
  border-bottom: calc(var(--unit) * 3) solid transparent;
  background: none;
  color: rgb(236 229 216 / 0.6);
  font-size: calc(var(--unit) * 24);
}

.tab[aria-selected="true"] {
  border-bottom-color: #d3bc8e;
  color: #ece5d8;
}

.close {
  position: absolute;
  right: calc(var(--unit) * 60);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: 50%;
  background: #ece5d8;
  color: #3b4255;
  font-size: calc(var(--unit) * 36);
  line-height: 1;
}

.list {
  position: absolute;
  top: calc(var(--unit) * 110);
  bottom: calc(var(--unit) * 120);
  left: calc(var(--unit) * 150);
  display: flex;
  width: calc(var(--unit) * 680);
  flex-direction: column;
  gap: calc(var(--unit) * 10);
  overflow-y: auto;
}

.heading {
  margin: calc(var(--unit) * 16) 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.quest {
  display: block;
  width: 100%;
  min-height: calc(var(--unit) * 80);
  margin-bottom: calc(var(--unit) * 10);
  padding: 0 calc(var(--unit) * 24);
  background: rgb(255 255 255 / 0.1);
  color: inherit;
  font-size: calc(var(--unit) * 28);
  text-align: start;
}

.quest.selected {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}

.quest.tracked {
  color: #d3bc8e;
}

.details {
  position: absolute;
  top: calc(var(--unit) * 120);
  right: calc(var(--unit) * 150);
  bottom: calc(var(--unit) * 60);
  display: flex;
  width: calc(var(--unit) * 900);
  flex-direction: column;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 40);
  font-weight: 600;
}

.step {
  display: flex;
  justify-content: space-between;
  margin: calc(var(--unit) * 32) 0 0;
  padding: calc(var(--unit) * 14) calc(var(--unit) * 24);
  background: rgb(255 255 255 / 0.1);
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
}

.description {
  margin: calc(var(--unit) * 20) 0 0;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: 1.4;
}

.navigate {
  align-self: flex-end;
  min-width: calc(var(--unit) * 400);
  min-height: calc(var(--unit) * 72);
  margin-top: auto;
  border-radius: calc(var(--unit) * 36);
  background: #ece5d8;
  color: #3b4255;
  font-size: calc(var(--unit) * 30);
}
</style>
