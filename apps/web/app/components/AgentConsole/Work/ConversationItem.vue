<script setup lang="ts">
import type { getConversationEvents } from "@/services/agentConsole/getConversationEvents";

import { formatTokenCount } from "@/services/agentConsole/formatTokenCount";
import { getDurationSeconds } from "@/services/agentConsole/getDurationSeconds";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { AgentEventType } from "agent-console-server/contracts";

interface Props {
  event: ReturnType<typeof getConversationEvents>[number];
}

const { event } = defineProps<Props>();
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <div v-if="event.type === AgentEventType.UserMessage" flex gap-1 justify-end>
    <v-sheet rounded="lg" color="surface-light" max-w="[80%]" white-space-pre-wrap px-3 py-2>
      {{ event.text }}
      <v-chip v-if="event.imageCount > 0" size="x-small" prepend-icon="mdi-image">{{ event.imageCount }}</v-chip>
    </v-sheet>
    <AgentConsoleWorkMessageMenu :message-uuid="event.messageUuid" :session-id="currentSessionId" />
  </div>
  <div v-else-if="event.type === AgentEventType.AssistantMessage" flex gap-1>
    <AgentConsoleMarkdown flex-1 min-w-0 :source="event.text" />
    <div flex flex-col>
      <StyledClipboardIconButton :source="event.text" />
      <AgentConsoleWorkMessageMenu :message-uuid="event.messageUuid" :session-id="currentSessionId" />
    </div>
  </div>
  <v-expansion-panels v-else-if="event.type === AgentEventType.Thinking" variant="accordion">
    <v-expansion-panel :disabled="!event.thinking" title="Thinking" :text="event.thinking || 'Hidden by the model'" />
  </v-expansion-panels>
  <v-expansion-panels v-else-if="event.type === AgentEventType.Hook" variant="accordion">
    <v-expansion-panel :title="`Hook · ${event.hookEvent} · ${event.phase}`">
      <template #text>
        <pre white-space-pre-wrap>{{ event.output || event.stdout || event.stderr || "No output" }}</pre>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
  <v-sheet v-else-if="event.type === AgentEventType.CommandOutput" white-space-pre-wrap font-mono px-3 py-2 rounded>
    {{ event.content }}
  </v-sheet>
  <v-alert v-else-if="event.type === AgentEventType.HostError" type="error" density="compact" :text="event.message" />
  <v-divider v-else-if="event.type === AgentEventType.Compaction">
    Context compacted · {{ formatTokenCount(event.preTokens) }} → {{ formatTokenCount(event.postTokens) }} tokens
  </v-divider>
  <v-divider v-else-if="event.type === AgentEventType.TurnResult" op-medium-emphasis text-label-small>
    {{ event.isError ? event.subtype : "Turn" }} · {{ getDurationSeconds(event.durationMs) }}s ·
    {{ event.numTurns }} requests
  </v-divider>
  <v-expansion-panels v-else-if="event.type === AgentEventType.Unknown" variant="accordion">
    <v-expansion-panel :title="event.sdkType" op-medium-emphasis>
      <template #text>
        <pre of-x-auto>{{ event.raw }}</pre>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
