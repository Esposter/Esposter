<script setup lang="ts">
import type { ToolCall } from "@/models/agentConsole/ToolCall";

import { RESULT_PREVIEW_LINE_COUNT } from "@/services/agentConsole/constants";
import { getDurationSeconds } from "@/services/agentConsole/getDurationSeconds";

interface Props {
  toolCall: ToolCall;
}

const { toolCall } = defineProps<Props>();
// A call's duration is the time between the call and its result; one still running shows how long it has been going
const duration = computed(() =>
  toolCall.result
    ? `${getDurationSeconds(toolCall.result.createdAt.getTime() - toolCall.toolUse.createdAt.getTime())}s`
    : toolCall.elapsedSeconds > 0
      ? `${toolCall.elapsedSeconds}s…`
      : "…",
);
const summary = computed(() => {
  const [firstValue] = Object.values(toolCall.toolUse.input);
  return typeof firstValue === "string" ? firstValue : "";
});
// Folded, a call still shows the first lines of what it returned, as the terminal prints them under the call
const isOpen = ref(false);
const resultPreview = computed(() => {
  if (!toolCall.result) return "";
  const lines = toolCall.result.content.split("\n");
  const previewLines = lines.slice(0, RESULT_PREVIEW_LINE_COUNT);
  if (lines.length > RESULT_PREVIEW_LINE_COUNT)
    previewLines.push(`… ${lines.length - RESULT_PREVIEW_LINE_COUNT} more lines`);
  return previewLines.join("\n");
});
</script>

<template>
  <div flex flex-col min-w-0>
    <details @toggle="isOpen = !isOpen">
      <summary flex gap-2 min-w-0 cursor-pointer>
        <AgentConsolePanelSpinner v-if="!toolCall.result" />
        <span v-else-if="toolCall.result.isError" class="error">✗</span>
        <span v-else class="success">✓</span>
        <span>{{ toolCall.toolUse.name }}</span>
        <span class="muted" flex-1 min-w-0 truncate>{{ summary }}</span>
        <span class="muted">{{ duration }}</span>
      </summary>
      <pre of-x-auto>{{ JSON.stringify(toolCall.toolUse.input, null, 2) }}</pre>
      <pre v-if="toolCall.result" class="result" ws-pre-wrap of-x-auto>{{ toolCall.result.content }}</pre>
    </details>
    <pre v-if="!isOpen && resultPreview" class="muted" pl-4 ws-pre-wrap of-x-auto>{{ resultPreview }}</pre>
  </div>
</template>

<style scoped>
.success {
  color: var(--agent-console-success);
}

.error {
  color: var(--agent-console-error);
}

.muted {
  color: var(--agent-console-muted);
}

.result {
  border-top: 0.125rem solid var(--agent-console-panel-edge);
}
</style>
