<script setup lang="ts">
import type { WorldLevelAdjustPrompt } from "#src/models/adventureRank/WorldLevelAdjustPrompt";
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The World Level now and the one the change sets, and whether the change lowers it
  adjustPrompt: WorldLevelAdjustPrompt;
  // The game's words in the reader's language
  gameText: GameText;
  // A state every choice is drawn in, forced by a fixture; a reader's pointer sets it itself
  interactionState?: InteractionState;
}

const { adjustPrompt, gameText, interactionState } = defineProps<Props>();
const emit = defineEmits<{ close: []; confirm: [] }>();
const cancelButton = useTemplateRef("cancelButton");
// The tips are the change's own words, in the colours their tags give them
const tipsSegments = computed(() =>
  splitGameTextColors(
    gameText[adjustPrompt.isLowering ? GameTextKey.WorldLevelLowerTips : GameTextKey.WorldLevelRevertTips],
  ),
);
// The prompt is a dialog over the World Level dialog, so focus starts on Cancel, the way back to it
onMounted(() => {
  cancelButton.value?.focus();
});
</script>

<template>
  <!-- The Change World Level prompt the World Level dialog's button opens over it: the World Level now and the one the
       change sets, the question when it lowers the World Level, and what the change does. Cancel returns to the dialog,
       and Confirm changes the World Level. The layout is provisional until the 2024 recording's prompt is measured -->
  <GameScreen
    class="world-level-prompt"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.ChangeWorldLevel]"
    :interaction-state
    @keydown.esc.stop="emit('close')"
  >
    <div class="backdrop" />
    <div class="dialog">
      <p class="title">{{ gameText[GameTextKey.ChangeWorldLevel] }}</p>
      <p v-if="adjustPrompt.isLowering" class="question">{{ gameText[GameTextKey.WorldLevelLowerQuestion] }}</p>
      <div class="levels">
        <p class="level">
          <span class="label">{{ gameText[GameTextKey.WorldLevelCurrent] }}</span>
          <span class="value">{{ adjustPrompt.currentWorldLevel }}</span>
        </p>
        <p class="level">
          <span class="label">{{ gameText[GameTextKey.WorldLevelAdjustedTo] }}</span>
          <span class="value">{{ adjustPrompt.adjustedWorldLevel }}</span>
          <span class="aim">
            {{ gameText[adjustPrompt.isLowering ? GameTextKey.WorldLevelLowered : GameTextKey.WorldLevelReverted] }}
          </span>
        </p>
      </div>
      <p class="tips">
        <span v-for="({ color, text }, index) of tipsSegments" :key="index" :style="{ color }">{{ text }}</span>
      </p>
      <GameButton ref="cancelButton" class="choice cancel" :kind="GameButtonKind.Row" @click="emit('close')">
        <span class="label-text">{{ gameText[GameTextKey.Cancel] }}</span>
      </GameButton>
      <GameButton class="choice confirm" :kind="GameButtonKind.Row" @click="emit('confirm')">
        <span class="label-text">{{ gameText[GameTextKey.Confirm] }}</span>
      </GameButton>
    </div>
  </GameScreen>
</template>

<style scoped>
.world-level-prompt {
  --reference-pixel: calc(var(--unit) * 1);
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 48%);
}

.dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 960);
  height: calc(var(--reference-pixel) * 606);
  transform: translate(-50%, -50%);
  background: #e2dfd8;
  color: #3a434b;
}

.title,
.question,
.tips {
  position: absolute;
  left: 0;
  width: 100%;
  margin: 0;
  text-align: center;
}

.title {
  top: calc(var(--reference-pixel) * 60);
  font-size: calc(var(--reference-pixel) * 40);
}

.question {
  top: calc(var(--reference-pixel) * 150);
  font-size: calc(var(--reference-pixel) * 32);
}

.levels {
  position: absolute;
  top: calc(var(--reference-pixel) * 220);
  left: 0;
  width: 100%;
  font-size: calc(var(--reference-pixel) * 32);
}

.level {
  display: flex;
  justify-content: center;
  gap: calc(var(--reference-pixel) * 20);
  margin: 0 0 calc(var(--reference-pixel) * 16);
}

.value {
  font-weight: 600;
}

.aim {
  font-style: italic;
}

.tips {
  top: calc(var(--reference-pixel) * 340);
  padding: 0 calc(var(--reference-pixel) * 60);
  font-size: calc(var(--reference-pixel) * 26);
  line-height: calc(var(--reference-pixel) * 36);
}

.choice {
  position: absolute;
  top: calc(var(--reference-pixel) * 498);
  width: calc(var(--reference-pixel) * 390);
  height: calc(var(--reference-pixel) * 67);
  border-radius: calc(infinity * 1px);
  background: #404a5e;
  color: #ffffff;
  text-align: center;
}

.cancel {
  left: calc(var(--reference-pixel) * 70);
}

.confirm {
  left: calc(var(--reference-pixel) * 500);
}

.label-text {
  font-size: calc(var(--reference-pixel) * 36);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 67);
}
</style>
