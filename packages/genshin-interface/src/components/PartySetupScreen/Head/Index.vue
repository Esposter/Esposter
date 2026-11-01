<script setup lang="ts">
import CloseButton from "#src/components/CloseButton/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";

interface Props {
  // The words of the Close button in the reader's language
  backLabel: string;
  // The words of the Elemental Resonance button at the top right, in the reader's language
  resonanceLabel: string;
  // The screen's title, the game's own words for Party Setup
  title: string;
}

const { backLabel, resonanceLabel, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <header class="head">
    <svg class="party-icon" viewBox="56 24 40 52" aria-hidden="true">
      <circle class="back" cx="84" cy="35" r="5.5" />
      <path class="back" d="M80 44h13l-3.5 16q-2.5 8-5 8t-4-8z" />
      <circle class="front" cx="72" cy="34.5" r="6.5" />
      <path class="front" d="M60 46h24l-11.5 25h-2z" />
    </svg>
    <h1 class="title">{{ title }}</h1>
    <svg class="steps" viewBox="880 30 150 36" aria-hidden="true">
      <path class="step-on" d="M906 37l10.5 10.5-10.5 10.5-10.5-10.5z" />
      <path
        class="step-off"
        d="M942 39.5l8.5 8.5-8.5 8.5-8.5-8.5z M978 39.5l8.5 8.5-8.5 8.5-8.5-8.5z M1014 39.5l8.5 8.5-8.5 8.5-8.5-8.5z"
      />
    </svg>
    <div class="resonance-pill" aria-hidden="true" />
    <svg class="resonance-icon" viewBox="0 0 136 120" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M61.5 20h45l3 1 2.5 2.5 1 2v9l-5.5 4.5h-35l-2 1-1-1h-10l-4.5-3.5q-2-2.5-1-8l3.5-6.5q3.25.75 4-1z M23.5 21h11l4.5 3.5q2 2.5 1 8l-4.5 5.5q-2.83 2.17-9 1l-3-1-4.5-4.5v-6l1-3 3.5-3.5z M62.5 51h42q.75 1.75 4 1l3.5 2.5 2 5q-2.25 1.25-1 6l-3.5 3.5-2 1h-10l-1 1h-35l-3-1-4.5-4.5v-7l1-3 3.5-3.5q3.25.75 4-1z M25.5 52h9l5.5 5.5q1.53 9.03-3.5 11.5l-6 2h-3l-6.5-4.5q-2.33-3.17-1-10l5.5-4.5z M65.5 82l3 1h39l4.5 2.5 1 3v8l-2.5 3.5-3 1h-48l-5.5-4.5v-8q2.5-1 2-3.5l4.5-2q4 1 5-1z M27.5 83h4l5.5 2q-.5 2.5 2 3.5l1 5q-1.75.75-1 4l-2.5 2.5-3 1h-6l-1-1h-3l-2.5-1-2-6.5 1-1v-3l1-2.5 6.5-3z"
      />
    </svg>
    <p class="resonance-text">{{ resonanceLabel }}</p>
    <CloseButton class="close" :label="backLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
  </header>
</template>

<style scoped>
.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 94);
}

.party-icon {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--unit) * 56);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 52);
}

.party-icon .front {
  fill: #f4f8fd;
}

.party-icon .back {
  fill: #707891;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 35);
  left: calc(var(--unit) * 122);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 1.6);
}

.steps {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 880);
  width: calc(var(--unit) * 150);
  height: calc(var(--unit) * 36);
}

.step-on {
  fill: #f4fbf8;
}

.step-off {
  fill: #07316e;
  stroke: #5a84c6;
  stroke-width: 2;
}

.resonance-pill {
  position: absolute;
  top: calc(var(--unit) * 27);
  left: calc(var(--unit) * 1430);
  width: calc(var(--unit) * 332);
  height: calc(var(--unit) * 40);
  border-radius: calc(var(--unit) * 20);
  background: rgb(255 255 255 / 0.08);
}

.resonance-icon {
  position: absolute;
  top: calc(var(--unit) * 33);
  left: calc(var(--unit) * 1446);
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 30);
  fill: #ecfcff;
}

.resonance-text {
  position: absolute;
  top: calc(var(--unit) * 35);
  left: calc(var(--unit) * 1487);
  margin: 0;
  color: #c6d5f7;
  font-size: calc(var(--unit) * 26);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 1.3);
  white-space: nowrap;
}

.close {
  top: calc(var(--unit) * 18.5);
  left: calc(var(--unit) * 1814);
  background: #e1e2d4;
  box-shadow: inset 0 0 0 calc(var(--unit) * 5) #80858a;
  color: #3f3e43;
}
</style>
