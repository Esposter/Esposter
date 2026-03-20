<script setup lang="ts">
interface FindReplaceHighlightProps {
  isCurrentOccurrence: boolean;
  search: string;
  text: string;
}

const { isCurrentOccurrence, search, text } = defineProps<FindReplaceHighlightProps>();
const container = useTemplateRef("container");
const parts = computed(() => {
  if (!search) return [{ isMatch: false, text }];
  const result: { isMatch: boolean; text: string }[] = [];
  let remaining = text;
  let index = remaining.indexOf(search);
  while (index !== -1) {
    if (index > 0) result.push({ isMatch: false, text: remaining.slice(0, index) });
    result.push({ isMatch: true, text: search });
    remaining = remaining.slice(index + search.length);
    index = remaining.indexOf(search);
  }
  if (remaining) result.push({ isMatch: false, text: remaining });
  return result;
});

watch(
  () => isCurrentOccurrence,
  async (newIsCurrentOccurrence) => {
    if (!newIsCurrentOccurrence) return;
    await nextTick();
    container.value?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
);
</script>

<template>
  <span ref="container">
    <template v-for="({ isMatch, text: part }, partIndex) of parts" :key="partIndex">
      <mark
        v-if="isMatch"
        :class="isCurrentOccurrence ? 'bg-amber-400' : 'bg-yellow-200'"
        :data-find-replace-current="isCurrentOccurrence || undefined"
      >
        {{ part }}
      </mark>
      <template v-else>{{ part }}</template>
    </template>
  </span>
</template>
