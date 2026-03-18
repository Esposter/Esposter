<script setup lang="ts">
interface FindReplaceHighlightProps {
  isCurrent: boolean;
  search: string;
  text: string;
}

const { isCurrent, search, text } = defineProps<FindReplaceHighlightProps>();
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
</script>

<template>
  <span>
    <template v-for="({ isMatch, text: part }, partIndex) of parts" :key="partIndex">
      <mark
        v-if="isMatch"
        :class="isCurrent ? 'bg-amber-400' : 'bg-yellow-200'"
        :data-find-replace-current="isCurrent || undefined"
      >
        {{ part }}
      </mark>
      <template v-else>{{ part }}</template>
    </template>
  </span>
</template>
