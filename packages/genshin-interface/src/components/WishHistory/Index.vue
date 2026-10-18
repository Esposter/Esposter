<script setup lang="ts">
import type { WishHistoryCell } from "#src/models/WishHistoryCell";

import RarityStars from "#src/components/RarityStars/Index.vue";

interface Props {
  // The way out of the popup in the reader's language
  closeLabel: string;
  // The draws the wish history keeps, the newest first
  history: WishHistoryCell[];
  title: string;
}

const { closeLabel, history, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The History popup the wish screen's History opens: the draws of the last year, newest first, over the wish screen
       until its close is clicked. Provisional: its columns, their order and the time's format wait on a recording of the
       English Client's History at 1080 high -->
  <div class="wish-history" role="dialog" :aria-label="title">
    <div class="panel">
      <p class="title">{{ title }}</p>
      <button class="close" type="button" :aria-label="closeLabel" @click="emit('close')">✕</button>
      <ul class="draws">
        <li v-for="({ bannerLabel, name, rarity, time }, index) of history" :key="index" class="draw">
          <span class="time">{{ time }}</span>
          <span class="banner">{{ bannerLabel }}</span>
          <span class="name">{{ name }}</span>
          <RarityStars :rarity />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wish-history {
  position: absolute;
  inset: 0;
  display: grid;
  background: rgb(0 0 0 / 0.5);
  place-items: center;
}

.panel {
  position: relative;
  display: flex;
  width: calc(var(--unit) * 1200);
  max-height: 100%;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  padding: calc(var(--unit) * 32) calc(var(--unit) * 40);
  box-sizing: border-box;
  border-radius: calc(var(--unit) * 8);
  background: rgb(28 32 42 / 0.96);
  color: #ece5d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 24);
  right: calc(var(--unit) * 24);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
}

.draws {
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  font-size: calc(var(--unit) * 18);
}

.draw {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: calc(var(--unit) * 16);
  padding: calc(var(--unit) * 6) 0;
}
</style>
