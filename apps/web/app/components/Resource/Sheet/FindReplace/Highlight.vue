<script setup lang="ts">
interface Props {
  isCurrentOccurrence: boolean;
  search: string;
  text: string;
}

const { isCurrentOccurrence, search, text } = defineProps<Props>();
const container = useTemplateRef("container");
const parts = computed(() => {
  if (!search) return [{ isMatch: false, text }];
  const highlightParts: { isMatch: boolean; text: string }[] = [];
  let remaining = text;
  let index = remaining.indexOf(search);
  while (index !== -1) {
    if (index > 0) highlightParts.push({ isMatch: false, text: remaining.slice(0, index) });
    highlightParts.push({ isMatch: true, text: search });
    remaining = remaining.slice(index + search.length);
    index = remaining.indexOf(search);
  }
  if (remaining) highlightParts.push({ isMatch: false, text: remaining });
  return highlightParts;
});

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
