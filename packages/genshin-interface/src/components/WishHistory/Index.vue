<script setup lang="ts">
import type { WishHistoryCell } from "#src/models/WishHistoryCell";

import CloseButton from "#src/components/CloseButton/Index.vue";
import RarityStars from "#src/components/RarityStars/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";

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
      <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
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
.panel {
  max-height: 100%;
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

<style scoped src="../../styles/wishOverlay.css"></style>
