<script setup lang="ts">
import type { Tokens } from "marked";

import { sanitizeHtml } from "@esposter/shared";
import { marked } from "marked";

interface Props {
  source: string;
}

const { source } = defineProps<Props>();
// A code block stays its own block, so it copies on its own; everything else the agent writes is rendered as markdown
// And never trusted, sanitized like any other markdown the app shows
const blocks = computed(() =>
  marked
    .lexer(source)
    .map((token): string | Tokens.Code =>
      token.type === "code" ? (token as Tokens.Code) : sanitizeHtml(marked.parser([token])),
    ),
);
</script>

<template>
  <div class="markdown" flex flex-col gap-2 min-w-0>
    <template v-for="(block, index) of blocks" :key="index">
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized above -->
      <div v-if="typeof block === 'string'" v-html="block" />
      <div v-else relative>
        <pre p-2 of-x-auto><code>{{ block.text }}</code></pre>
        <UiCopyButton :source="block.text" right-1 top-1 absolute />
      </div>
    </template>
  </div>
</template>

<style scoped>
.markdown pre,
.markdown :deep(pre) {
  background-color: var(--ui-background);
}

.markdown :deep(a) {
  color: var(--ui-info);
}

.markdown :deep(:is(ul, ol)) {
  padding-left: 1.5rem;
}
</style>
