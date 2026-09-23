<script setup lang="ts">
import type { StreamDraft } from "@/models/agentConsole/StreamDraft";

interface Props {
  streamDraft: StreamDraft;
}

const { streamDraft } = defineProps<Props>();
</script>

<template>
  <!-- Drawn as the whole block will be, so nothing shifts when the pieces are replaced by it -->
  <details v-if="streamDraft.isThinking" class="folded" open>
    <summary>✻ Thinking</summary>
    <p class="muted" ws-pre-wrap>{{ streamDraft.text }}</p>
  </details>
  <AgentConsoleMarkdown v-else :source="streamDraft.text" />
</template>

<style scoped>
.folded summary {
  color: var(--agent-console-muted);
  cursor: pointer;
}

.muted {
  color: var(--agent-console-muted);
}
</style>
