<script setup lang="ts">
import { GAME_CREAM, GAME_REPLY_HOVER_INK, GAME_ROW_HOVER, GAME_ROW_PRESS } from "#src/services/constants";

interface Props {
  // The request the keeper offers, its title and the button that takes it in the reader's language
  offer: { acceptLabel: string; title: string };
}

const { offer } = defineProps<Props>();
const emit = defineEmits<{ accept: [] }>();
</script>

<template>
  <section class="offer">
    <p class="offer-title">{{ offer.title }}</p>
    <button class="accept gradient-tint" type="button" @click="emit('accept')">{{ offer.acceptLabel }}</button>
  </section>
</template>

<style scoped>
/* The offer sits under the requirement, provisionally, until the reference frames it */
.offer {
  position: absolute;
  top: calc(var(--unit) * 380);
  left: calc(var(--unit) * 85);
  width: calc(var(--unit) * 520);
  color: v-bind(GAME_CREAM);
}

.offer-title {
  margin: 0 0 calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 26);
}

.accept {
  padding: calc(var(--unit) * 12) calc(var(--unit) * 32);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: v-bind(GAME_CREAM);
  color: v-bind(GAME_REPLY_HOVER_INK);
  --tint-hover: v-bind(GAME_ROW_HOVER);
  --tint-press: v-bind(GAME_ROW_PRESS);
  font: inherit;
  font-size: calc(var(--unit) * 26);
}
</style>

<style scoped src="../../../styles/gradientTint.css"></style>
