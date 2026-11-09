<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GAME_CREAM, INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's own words the popup's heading and its button are read from
  gameText: GameText;
  // The tip's subtitle in the reader's language, which the popup shows under its title
  subtitle: string;
  // The tip's title in the reader's language
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{
  // The button that closes the tip, after which the next tip waiting is shown
  close: [];
}>();
</script>

<template>
  <div class="tip">
    <div class="card" role="dialog" :aria-label="title">
      <p class="heading">{{ gameText[GameTextKey.TipHeading] }}</p>
      <p class="title">{{ title }}</p>
      <p class="subtitle">{{ subtitle }}</p>
      <button class="dismiss ring-button" type="button" @click="emit('close')">
        {{ gameText[GameTextKey.TipDismiss] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tip {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: min(90vw, 32rem);
}

.card {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 0.8);
  color: #fff;
  text-align: center;
}

.heading {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.7;
}

.title {
  margin: 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.subtitle {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
}

/* Provisional: no reference frame shows the tip's button, so its states are the cream pill's own: a white ring lights at
   its edge when hovered or focused (`ringButton.css`), and a press tints it slate with its words cream */
.dismiss {
  --hover-duration: v-bind(INTERACTION_HOVER_DURATION);
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  padding: 0.25rem 1rem;
  border-radius: 0.25rem;
  background: #fff;
  color: #000;
  cursor: pointer;
  outline: 0.125rem solid transparent;
}

.dismiss:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  background: rgb(73 83 103 / 0.5);
  color: v-bind(GAME_CREAM);
}
</style>

<style scoped src="genshin-interface/styles/ringButton.css"></style>
