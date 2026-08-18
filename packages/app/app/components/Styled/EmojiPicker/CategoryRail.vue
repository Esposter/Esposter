<script setup lang="ts">
import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";

interface StyledEmojiPickerCategoryRailProps {
  categories: EmojiCategory[];
}

const modelValue = defineModel<string>({ required: true });
const { categories } = defineProps<StyledEmojiPickerCategoryRailProps>();
</script>

<template>
  <v-tabs v-model="modelValue" h-full density="compact" direction="vertical">
    <v-tab v-for="{ icon, title } of categories" :key="title" :value="title">
      <v-icon :icon />
      <v-tooltip activator="parent" location="right" :text="title" />
    </v-tab>
  </v-tabs>
</template>

<style scoped lang="scss">
// Vuetify sizes a tab for a text label. The rail is icon-only, so it collapses to the icon plus its padding —
// And to a height that fits every category in the row the grid sets, instead of scrolling a ten-item rail
.v-tab {
  min-width: 0;
  min-height: 2.25rem;
  padding: 0 0.75rem;
}
</style>
