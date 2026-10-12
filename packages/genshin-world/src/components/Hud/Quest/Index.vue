<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestMark } from "#src/models/quest/QuestMark";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import { QUEST_MARK_MIN_HEIGHT } from "#src/services/quest/constants";
import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import { InputAction } from "genshin-engine";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
  // Where the navigated objective stands from the character, none while the tracker's quest is not navigated to or no
  // Region in reach places its objective
  mark?: QuestMark;
  // The quest on the tracker, and how far it has come, none for a quest just started
  quest: Quest;
  questProgress?: QuestProgress;
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { gameText, input, mark, quest, questProgress, textMap } = defineProps<Props>();
const step = computed(() => quest.steps[questProgress?.stepIndex ?? 0]);
</script>

<template>
  <!-- The HUD's quest tracker: the quest's title, the navigated objective's distance under it, named higher or lower
       With an arrow where it stands well above or below the character, and its step's line with how far its counted
       Objective has come. Pressing it navigates to the quest, as V does -->
  <button class="quest-tracker" type="button" @click="tapActionKey(input, InputAction.QuestNavigation)">
    <span class="title">{{ textMap[quest.titleTextId] }}</span>
    <span v-if="mark" class="mark">
      <template v-if="Math.abs(mark.height) >= QUEST_MARK_MIN_HEIGHT">
        <svg class="arrow" :class="{ lower: mark.height < 0 }" viewBox="0 0 14 9" aria-hidden="true">
          <path d="M 0 9 L 7 0 L 14 9 L 7 6 Z" />
        </svg>
        {{ gameText[mark.height > 0 ? GameTextKey.QuestMarkUp : GameTextKey.QuestMarkDown] }}
      </template>
      {{ fillGameTextValues(gameText[GameTextKey.QuestDistance], Math.round(mark.distance)) }}
    </span>
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

/* The navigated objective's line as the PC part of `world-pickup.mkv` shows it at 20 seconds and 1080 high, "Higher
   1523m": its letters 12 high to their capitals, so a size of 17.6 in the stand-in font, whose capitals are 0.683 of its
   Size, in the brightest yellow of their pixels, after a white arrowhead 14 wide and 9 high, notched at its foot, 6 before
   The word and level with the title's start. The phone's frame at 70 seconds reads the same. Provisional: its place under
   The title, with the tracker's */
.mark {
  display: flex;
  align-items: center;
  color: #f9e14e;
  font-size: calc(var(--unit) * 17.6);
  font-weight: 600;
  gap: calc(var(--unit) * 6);
}

.arrow {
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 9);
  fill: #fff;
}

.arrow.lower {
  scale: 1 -1;
}
</style>
