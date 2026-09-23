<script setup lang="ts">
import type { ToolCall } from "@/models/agentConsole/ToolCall";

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
  const { input } = toolCall.toolUse;
  const [firstValue] = Object.values(input);
  return typeof firstValue === "string" ? firstValue : "";
});
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div flex gap-2 min-w-0 w-full items-center>
        <v-icon
          :color="toolCall.result ? (toolCall.result.isError ? 'error' : 'success') : 'primary'"
          :icon="
            toolCall.result ? (toolCall.result.isError ? 'mdi-close-circle' : 'mdi-check-circle') : 'mdi-progress-clock'
          "
          size="small"
        />
        <span fw-bold>{{ toolCall.toolUse.name }}</span>
        <span flex-1 min-w-0 truncate op-medium-emphasis>{{ summary }}</span>
        <span op-medium-emphasis text-label-small>{{ duration }}</span>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <pre of-x-auto text-body-small>{{ JSON.stringify(toolCall.toolUse.input, null, 2) }}</pre>
      <v-divider v-if="toolCall.result" my-2 />
      <pre v-if="toolCall.result" ws-pre-wrap of-x-auto text-body-small>{{ toolCall.result.content }}</pre>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
