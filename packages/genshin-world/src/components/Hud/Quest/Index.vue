<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Input } from "genshin-engine";

import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";
import { InputAction } from "genshin-engine";

interface Props {
  input: Input;
  // The quest on the tracker, and how far it has come, none for a quest just started
  quest: Quest;
  questProgress?: QuestProgress;
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { input, quest, questProgress, textMap } = defineProps<Props>();
const questNavigationCode = getActionKeyCode(InputAction.QuestNavigation);
const step = computed(() => quest.steps[questProgress?.stepIndex ?? 0]);
</script>

<template>
  <!-- The HUD's quest tracker: the quest's title over its step's line and how far its counted objective has come.
       Pressing it navigates to the quest, as V does -->
  <button
    class="quest-tracker"
    type="button"
    @click="
      () => {
        input.press(questNavigationCode);
        input.release(questNavigationCode);
      }
    "
  >
    <span class="title">{{ textMap[quest.titleTextId] }}</span>
    <span v-if="step" class="step"
      >{{ textMap[step.textId] }} {{ getQuestCounter(step, questProgress?.objectiveCounts ?? []) }}</span
    >
  </button>
</template>

<style scoped>
/* Provisional: the tracker's width, type, colours and the quest kind's mark beside its title, measured off a recording
   Of the English PC client's world HUD with a quest navigated */
.quest-tracker {
  display: flex;
  width: calc(var(--unit) * 360);
  flex-direction: column;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: inherit;
  font: inherit;
  gap: calc(var(--unit) * 6);
  pointer-events: auto;
  text-align: start;
  text-shadow: 0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.6);
}

.title {
  color: #ffe6a1;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
}

.step {
  font-size: calc(var(--unit) * 20);
}
</style>
