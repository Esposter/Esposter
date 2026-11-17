<script setup lang="ts">
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import MenuTimeDial from "#src/components/Menu/Time/Dial/Index.vue";
import { TIME_DIAL_ORNAMENT_POSITIONS, TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { getTimeTargetMinutes } from "#src/services/menu/getTimeTargetMinutes";
import { MINUTES_PER_DAY } from "genshin-engine";
import { CloseButtonMark, GAME_CREAM, GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The world's clock minute of the day, which stays where it is while the screen is open, as the menus hold the clock
  clockMinutes: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The advance the dial opens at, in minutes: none as the game opens it, and the pointer turns it from there
  initialAdvance?: number | undefined;
}

const { clockMinutes, initialAdvance = 0 } = defineProps<Props>();
const emit = defineEmits<{ close: []; confirm: [minutes: number] }>();
const confirmButton = useTemplateRef("confirmButton");
// How far the pointer has dialled the advance, which the dial moves
const advance = ref(initialAdvance);
const targetMinutes = computed(() => getTimeTargetMinutes(clockMinutes, advance.value));
// Whether the target falls on the clock's own day, counting the advance from its minimum as the target does
const targetIsToday = computed(
  () => clockMinutes + Math.max(advance.value, TIME_MINIMUM_ADVANCE_MINUTES) < MINUTES_PER_DAY,
);
const formatMinutes = (minutes: number): string => {
  const wholeMinutes = Math.floor(minutes);
  return Temporal.PlainTime.from({ hour: Math.floor(wholeMinutes / 60), minute: wholeMinutes % 60 }).toString({
    smallestUnit: "minute",
  });
};
const clockTime = computed(() => formatMinutes(clockMinutes));
const targetTime = computed(() => formatMinutes(targetMinutes.value));
// The screen is a full screen over the world, so focus starts on the screen's one action, which is the way forward
onMounted(() => {
  confirmButton.value?.focus();
});
</script>

<template>
  <!-- The Time screen the Paimon menu's side bar opens: its title and the cross that closes it, the clock's dial on the
       right of the screen and, in the middle, the clock's time and the hour the dial points at, with Today beneath that
       hour while it falls on the clock's day, then Confirm, which sets the world's clock to that hour. The dial and the
       column are placed from the English PC client's screen (1080 high, a reference pixel a unit). -->
  <GameScreen class="menu-time" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Time]">
    <ScreenHeader :game-text :mark="CloseButtonMark.Cross" :title="gameText[GameTextKey.Time]" @close="emit('close')" />
    <MenuTimeDial v-model="advance" :clock-minutes :target-minutes />
    <svg
      v-for="position of TIME_DIAL_ORNAMENT_POSITIONS"
      :key="position"
      :class="['ornament', position]"
      viewBox="0 0 70 24"
      aria-hidden="true"
    >
      <path d="M 2 18 L 22 8 L 29 12 M 68 18 L 48 8 L 41 12" fill="none" />
      <path d="M 35 2 L 41 12 L 35 22 L 29 12 Z" fill="#c6b794" />
    </svg>
    <p class="current-time">{{ gameText[GameTextKey.TimeCurrent] }}</p>
    <p class="clock-time">{{ clockTime }}</p>
    <span class="caret first" />
    <p class="wait-until">{{ gameText[GameTextKey.TimeWaitUntil] }}</p>
    <span class="caret second" />
    <p class="hour">{{ targetTime }}</p>
    <p v-if="targetIsToday" class="day">{{ gameText[GameTextKey.TimeToday] }}</p>
    <GameButton
      ref="confirmButton"
      class="confirm"
      :kind="GameButtonKind.Pill"
      tip=""
      @click="emit('confirm', targetMinutes)"
    >
      {{ gameText[GameTextKey.TimeConfirm] }}
    </GameButton>
  </GameScreen>
</template>

<style scoped>
.menu-time {
  --reference-pixel: var(--unit);
  color: v-bind(GAME_CREAM);
}

.ornament {
  position: absolute;
  left: 50%;
  width: calc(var(--reference-pixel) * 70);
  height: calc(var(--reference-pixel) * 24);
  stroke: #c6b794;
  stroke-width: 1.6;
  translate: -50% -50%;
}

.ornament.top {
  top: calc(var(--reference-pixel) * 337);
}

.ornament.bottom {
  top: calc(var(--reference-pixel) * 645);
}

.current-time,
.clock-time,
.wait-until,
.hour,
.day {
  position: absolute;
  left: 50%;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  translate: -50% -50%;
}

.current-time {
  top: calc(var(--reference-pixel) * 390);
  color: #c9b994;
  font-size: calc(var(--reference-pixel) * 19);
}

.clock-time {
  top: calc(var(--reference-pixel) * 450);
  color: #f3efe6;
  font-size: calc(var(--reference-pixel) * 28);
}

.wait-until {
  top: calc(var(--reference-pixel) * 507);
  color: #c9b994;
  font-size: calc(var(--reference-pixel) * 19);
}

.hour {
  top: calc(var(--reference-pixel) * 570);
  color: #f3efe6;
  font-size: calc(var(--reference-pixel) * 28);
}

.day {
  top: calc(var(--reference-pixel) * 605);
  font-size: calc(var(--reference-pixel) * 16);
}

.caret {
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  border-top: calc(var(--reference-pixel) * 5) solid #8f8f8f;
  border-inline: calc(var(--reference-pixel) * 4) solid transparent;
  translate: -50% -50%;
}

.caret.first {
  top: calc(var(--reference-pixel) * 476);
}

.caret.second {
  top: calc(var(--reference-pixel) * 539);
}

.confirm {
  position: absolute;
  top: calc(var(--reference-pixel) * 880);
  left: 50%;
  width: calc(var(--reference-pixel) * 300);
  height: calc(var(--reference-pixel) * 72);
  translate: -50% 0;
}
</style>
