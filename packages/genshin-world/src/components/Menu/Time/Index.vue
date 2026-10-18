<script setup lang="ts">
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { getTimeTargetMinutes } from "#src/services/menu/getTimeTargetMinutes";
import { stepTimeDialAdvance } from "#src/services/menu/stepTimeDialAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The world's clock minute of the day, which stays where it is while the screen is open, as the menus hold the clock
  clockMinutes: number;
  // The game's words in the reader's language
  gameText: GameText;
}

const { clockMinutes, gameText } = defineProps<Props>();
const emit = defineEmits<{ close: []; confirm: [minutes: number] }>();
const dial = useTemplateRef("dial");
const confirmButton = useTemplateRef("confirmButton");
// How far the pointer has dialled the advance, from none, and the angle it was at about the dial's centre while held
const advance = ref(0);
let pointerAngle: number | undefined;
const targetMinutes = computed(() => getTimeTargetMinutes(clockMinutes, advance.value));
// The hand stands at the top of the dial at midnight and turns clockwise through the day to the target's minute
const handStyle = computed(() => ({ transform: `rotate(${(targetMinutes.value / MINUTES_PER_DAY) * 360}deg)` }));
const targetTime = computed(() => {
  const minutes = Math.floor(targetMinutes.value);
  return Temporal.PlainTime.from({ hour: Math.floor(minutes / 60), minute: minutes % 60 }).toString({
    smallestUnit: "minute",
  });
});
// The pointer's angle about the dial's centre, which a drag steps the advance by as it turns round the dial
const getPointerAngle = (event: PointerEvent, element: HTMLElement): number => {
  const { height, left, top, width } = element.getBoundingClientRect();
  return Math.atan2(event.clientY - (top + height / 2), event.clientX - (left + width / 2));
};
const onDialPointerDown = (event: PointerEvent) => {
  if (!dial.value) return;
  dial.value.setPointerCapture(event.pointerId);
  pointerAngle = getPointerAngle(event, dial.value);
};
const onDialPointerMove = (event: PointerEvent) => {
  if (pointerAngle === undefined || !dial.value) return;
  const angle = getPointerAngle(event, dial.value);
  advance.value = stepTimeDialAdvance(advance.value, pointerAngle, angle);
  pointerAngle = angle;
};
const onDialPointerUp = () => {
  pointerAngle = undefined;
};
// The screen is a full screen over the world, so focus starts on the screen's one action, which is the way forward
onMounted(() => {
  confirmButton.value?.focus();
});
</script>

<template>
  <!-- The Time screen the Paimon menu's side bar opens: its title and the cross that closes it, a dial the pointer turns
       to dial the advance, the hour the dial points at and Confirm, which sets the world's clock to that hour. Each
       Place is provisional until the English PC client's own screen is fitted to the reference -->
  <GameScreen class="menu-time" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Time]">
    <ScreenHeader :game-text :title="gameText[GameTextKey.Time]" @close="emit('close')" />
    <div
      ref="dial"
      class="dial"
      @pointerdown="(event) => onDialPointerDown(event)"
      @pointermove="(event) => onDialPointerMove(event)"
      @pointerup="onDialPointerUp()"
      @pointercancel="onDialPointerUp()"
    >
      <span class="hand" :style="handStyle" />
      <span class="hub" />
    </div>
    <p class="wait-until">{{ gameText[GameTextKey.TimeWaitUntil] }}</p>
    <p class="hour">{{ targetTime }}</p>
    <GameButton ref="confirmButton" class="confirm" :kind="GameButtonKind.Pill" @click="emit('confirm', targetMinutes)">
      {{ gameText[GameTextKey.TimeConfirm] }}
    </GameButton>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the dial, its hand and the labels are placed in the reference's own pixels, one of its pixels a unit,
   Once the English PC client's Time screen has been fitted to it */
.menu-time {
  --reference-pixel: var(--unit);
  color: #ece5d8;
}

.dial {
  position: absolute;
  top: calc(var(--reference-pixel) * 430);
  left: 50%;
  width: calc(var(--reference-pixel) * 360);
  height: calc(var(--reference-pixel) * 360);
  border: calc(var(--reference-pixel) * 6) solid #ece5d8;
  border-radius: 50%;
  background: rgb(20 24 36 / 0.6);
  cursor: grab;
  touch-action: none;
  translate: -50% -50%;
}

.hand {
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(var(--reference-pixel) * 8);
  height: 50%;
  background: #ffefc0;
  transform-origin: 50% 100%;
  translate: -50% 0;
}

.hub {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 24);
  height: calc(var(--reference-pixel) * 24);
  border-radius: 50%;
  background: #ffefc0;
  translate: -50% -50%;
}

.wait-until {
  position: absolute;
  top: calc(var(--reference-pixel) * 760);
  left: 50%;
  margin: 0;
  font-size: calc(var(--reference-pixel) * 26);
  translate: -50% 0;
}

.hour {
  position: absolute;
  top: calc(var(--reference-pixel) * 800);
  left: 50%;
  margin: 0;
  font-size: calc(var(--reference-pixel) * 48);
  font-weight: 600;
  translate: -50% 0;
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
