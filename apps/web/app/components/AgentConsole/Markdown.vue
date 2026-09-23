<script setup lang="ts">
import { sanitizeHtml } from "@esposter/shared";
import { marked } from "marked";

interface Props {
  source: string;
}

const { source } = defineProps<Props>();
// Whatever the agent writes is rendered, never trusted: sanitized like any other markdown the app shows
const html = computed(() => sanitizeHtml(marked.parse(source, { async: false })));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- sanitized above -->
  <div class="markdown" v-html="html" />
</template>

<style scoped>
.markdown :deep(pre) {
  overflow-x: auto;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.markdown :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
