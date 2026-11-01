<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The words over the ring: the queue's time left, or Complete once every unit is done
  forgedLabel: string;
  // The words over the ring's centre, its time left or its state, in the game's words
  headingLabel: string;
  // Whether a unit is Ready to obtain, which shows the Obtain button
  isObtainable: boolean;
  obtainLabel: string;
  // The share of the unit being forged, between none and all of it
  progress: number;
  // The queue the Obtain button hands back
  queueId: number;
}

const { forgedLabel, headingLabel, isObtainable, obtainLabel, progress, queueId } = defineProps<Props>();
const emit = defineEmits<{ obtain: [queueId: number] }>();
</script>

<template>
  <p class="detail-heading">{{ headingLabel }}</p>
  <span v-if="progress < 1" aria-hidden="true" class="detail-ring" />
  <p class="detail-forged">{{ forgedLabel }}</p>
  <span class="detail-track">
    <span class="detail-fill" :style="{ width: `${progress * 100}%` }" />
  </span>
  <GameButton v-if="isObtainable" class="action" :kind="GameButtonKind.Row" tip="" @click="emit('obtain', queueId)">
    {{ obtainLabel }}
  </GameButton>
</template>

<style scoped>
.detail-ring {
  top: calc(var(--unit) * 205);
  left: calc(var(--unit) * 1320);
  width: calc(var(--unit) * 540);
  height: calc(var(--unit) * 350);
  border: calc(var(--unit) * 14) solid rgb(240 160 50 / 0.85);
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--unit) * 30) rgb(255 150 40 / 0.5);
}
.detail-heading,
.detail-forged {
  left: calc(var(--unit) * 1590);
  translate: -50% 0;
  font-size: calc(var(--unit) * 31);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 1.5);
  white-space: nowrap;
}
.detail-heading {
  top: calc(var(--unit) * 149);
}
.detail-forged {
  top: calc(var(--unit) * 566);
}
.detail-track {
  top: calc(var(--unit) * 620);
  left: calc(var(--unit) * 1225);
  width: calc(var(--unit) * 731);
  height: calc(var(--unit) * 12);
  background: rgb(255 255 255 / 0.2);
}
.detail-fill {
  display: block;
  height: 100%;
  background: #f0a53a;
}
</style>
<style scoped src="../../../../styles/forgeDetail.css"></style>
