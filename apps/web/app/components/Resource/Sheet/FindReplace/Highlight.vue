<script setup lang="ts">
import { getHighlightParts } from "#src/services/resource/sheet/findReplace/getHighlightParts";

interface Props {
  isCurrentOccurrence: boolean;
  search: string;
  text: string;
}

const { isCurrentOccurrence, search, text } = defineProps<Props>();
const container = useTemplateRef("container");
const parts = computed(() => getHighlightParts(text, search));

watch(
  () => isCurrentOccurrence,
  (newIsCurrentOccurrence) => {
    if (!newIsCurrentOccurrence) return;
    container.value?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
  { flush: "post" },
);
</script>

<template>
  <span ref="container">
    <template v-for="({ isMatch, text: part }, partIndex) of parts" :key="partIndex">
      <mark v-if="isMatch" class="match" :data-find-replace-current="isCurrentOccurrence || undefined">
        {{ part }}
      </mark>
      <template v-else>{{ part }}</template>
    </template>
  </span>
</template>

<style scoped>
/* Every match is tinted in the accent, and the one the bar is on is filled with it, as a browser's find marks them */
.match {
  background-color: color-mix(in srgb, var(--ui-accent) 30%, transparent);
  color: inherit;
}

.match[data-find-replace-current] {
  background-color: var(--ui-accent);
  color: var(--ui-background);
}
</style>
