<script setup lang="ts">
import type { ForgeQueueCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { SECONDS_PER_MINUTE } from "#src/services/forging/constants";
import { ForgeQueueState, ForgeScreen, ForgeTab, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

// A queue as the game holds it: its state, the recipe it forges, how many it has forged, the seconds left on its order
// And the Adventure Rank it unlocks at
interface ForgeQueueSlot {
  forged: number;
  id: number;
  name: string;
  remainingSeconds: number;
  state: ForgeQueueState;
  unlockRank: number;
}

interface Props {
  // The amount slider's name for assistive tech, and the Materials tab's and buttons' words, which the game's text ids
  // Do not yet name in genshin-text
  amountLabel: string;
  // The most the selected recipe's queue holds
  amountMaximum: number;
  closeLabel: string;
  // The wallet's coins
  coins: number;
  // The game's words in the reader's language
  gameText: GameText;
  materialsLabel: string;
  obtainLabel: string;
  // The forge queues, each open one or locked until its Adventure Rank
  queues: ForgeQueueSlot[];
  // The Materials tab's recipes, in the game's order: each one's forge time in seconds
  recipes: { forgeSeconds: number; id: number; isLearned: boolean; name: string }[];
  requiredCoins: number;
  startLabel: string;
  // The total forge time of the selected recipe for its amount, in seconds
  totalSeconds: number;
}

const amount = defineModel<number>("amount", { default: 1 });
const recipeId = defineModel<number>("recipeId", { default: 0 });
const tab = defineModel<ForgeTab>("tab", { default: ForgeTab.Materials });
const { amountMaximum, coins, gameText, queues, recipes, requiredCoins, totalSeconds } = defineProps<Props>();
const emit = defineEmits<{ close: []; obtain: [queueId: number]; start: [] }>();
// A duration in the game's own shape: seconds under a minute, then whole minutes
const formatForgeTime = (seconds: number) =>
  seconds < SECONDS_PER_MINUTE ? `${seconds}s` : `${Math.floor(seconds / SECONDS_PER_MINUTE)}m`;
// Each queue's words in the reader's language, from the state it holds
const queueCells = computed<ForgeQueueCell[]>(() =>
  queues.map(({ forged, id, name, remainingSeconds, state, unlockRank }) => {
    switch (state) {
      case ForgeQueueState.Complete: {
        return {
          id,
          name,
          progressLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueProgress], forged),
          state,
          timeLabel: "",
        };
      }
      case ForgeQueueState.Forging: {
        return {
          id,
          name,
          progressLabel: gameText[GameTextKey.ForgeQueueForging],
          state,
          timeLabel: fillGameTextValues(gameText[GameTextKey.ForgeTimeRemaining], formatForgeTime(remainingSeconds)),
        };
      }
      case ForgeQueueState.Idle: {
        return { id, name: "", progressLabel: gameText[GameTextKey.ForgeQueueIdle], state, timeLabel: "" };
      }
      default: {
        return {
          id,
          name: "",
          progressLabel: "",
          state,
          timeLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueLockLevel], unlockRank),
        };
      }
    }
  }),
);
</script>

<template>
  <!-- The forge, the blacksmith's screen: its title and two tabs across the head with the coins and the way out, the
       recipes on the left with the chosen one's amount and cost beside them, or the queues each holding an order that
       forges over real time and is obtained when it is done -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ForgeTitle]">
    <ForgeScreen
      v-model:amount="amount"
      v-model:recipe-id="recipeId"
      v-model:tab="tab"
      :amount-label
      :amount-maximum
      :close-label
      :coins
      :materials-label
      :obtain-label
      :queues="queueCells"
      :queues-label="
        fillGameTextValues(
          gameText[GameTextKey.ForgeQueueButton],
          queues.filter(({ state }) => state === ForgeQueueState.Forging).length,
          queues.length,
        )
      "
      :recipes="
        recipes.map(({ forgeSeconds, id, isLearned, name }) => ({
          forgeTimeLabel: fillGameTextValues(gameText[GameTextKey.ForgeItemTime], formatForgeTime(forgeSeconds)),
          id,
          isLearned,
          name,
        }))
      "
      :required-coins
      :start-label
      :title="gameText[GameTextKey.ForgeTitle]"
      :total-time-label="fillGameTextValues(gameText[GameTextKey.ForgeTotalTime], formatForgeTime(totalSeconds))"
      @close="emit('close')"
      @obtain="(queueId) => emit('obtain', queueId)"
      @start="emit('start')"
    />
  </GameScreen>
</template>
