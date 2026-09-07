<script setup lang="ts">
import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";

interface Props {
  categories: EmojiCategory[];
  isHorizontal?: boolean;
}

const modelValue = defineModel<string>({ required: true });
const { categories, isHorizontal } = defineProps<Props>();
</script>

<template>
  <!-- A tooltip needs a pointer to hover, so the rail carries one only where the categories sit beside the grid.
       The tab is icon-only either way, so its title is its accessible name whether or not a tooltip shows it -->
  <v-tabs
    v-model="modelValue"
    density="compact"
    :class="isHorizontal ? 'w-full' : 'h-full'"
    :direction="isHorizontal ? 'horizontal' : 'vertical'"
  >
    <v-tab v-for="{ icon, title } of categories" :key="title" :aria-label="title" :value="title">
      <v-icon :icon />
      <v-tooltip v-if="!isHorizontal" activator="parent" location="right" :text="title" />
    </v-tab>
  </v-tabs>
</template>

<style scoped>
/* Vuetify sizes a tab for a text label. The rail is icon-only, so it collapses to the icon plus its padding —
   and to a height that fits every category in the row the grid sets, instead of scrolling a ten-item rail */
.v-tab {
  min-width: 0;
  min-height: 2.25rem;
  padding: 0 0.75rem;
}
</style>
