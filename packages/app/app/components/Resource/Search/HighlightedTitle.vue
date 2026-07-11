<script setup lang="ts">
import { getHighlightParts } from "@/services/resource/search/getHighlightParts";

interface HighlightedTitleProps {
  searchQuery: string;
  text: string;
}

const { searchQuery, text } = defineProps<HighlightedTitleProps>();
const highlightParts = computed(() => getHighlightParts(text, searchQuery));
</script>

<template>
  <span v-if="highlightParts"
    >{{ highlightParts.prefix }}<span font-bold>{{ highlightParts.match }}</span
    >{{ highlightParts.suffix }}</span
  >
  <span v-else>{{ text }}</span>
</template>
