<script setup lang="ts">
import type { ConversationEvent } from "@/models/agentConsole/ConversationEvent";

import { TOKEN_COUNT_FORMAT } from "@/services/agentConsole/constants";
import { getDurationSeconds } from "@/services/agentConsole/getDurationSeconds";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { AgentEventType } from "agent-console-server/contracts";

interface Props {
  event: ConversationEvent;
}

const { event } = defineProps<Props>();
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { toolCallMap } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <div v-if="event.type === AgentEventType.UserMessage" flex gap-2 justify-end>
    <AgentConsolePanelMessageActions :message-uuid="event.messageUuid" />
    <div class="user-message" px-3 py-1 ws-pre-wrap max-w="[80%]">
      {{ event.text }}
      <span v-if="event.attachmentCount > 0" class="muted">[{{ event.attachmentCount }} attached]</span>
    </div>
  </div>
  <div v-else-if="event.type === AgentEventType.AssistantMessage" flex flex-col gap-1>
    <AgentConsoleMarkdown :source="event.text" />
    <div flex gap-1>
      <AgentConsolePanelCopyButton :source="event.text" />
      <AgentConsolePanelMessageActions :message-uuid="event.messageUuid" />
    </div>
  </div>
  <!-- Open as it arrives, so what the agent is thinking reads beside what it says; a click folds it away -->
  <details v-else-if="event.type === AgentEventType.Thinking" class="folded" open>
    <summary>✻ Thinking</summary>
    <p class="muted" ws-pre-wrap>{{ event.thinking || "Hidden by the model" }}</p>
  </details>
  <!-- The fold records the call as it folds its use, so the call as first made is only ever the type's fallback -->
  <AgentConsolePanelToolCall
    v-else-if="event.type === AgentEventType.ToolUse"
    :tool-call="toolCallMap.get(event.toolUseId) ?? { elapsedSeconds: 0, toolUse: event }"
  />
  <details v-else-if="event.type === AgentEventType.Hook" class="folded">
    <summary>Hook · {{ event.hookEvent }} · {{ event.phase }}</summary>
    <pre ws-pre-wrap>{{ event.output || event.stdout || event.stderr || "No output" }}</pre>
  </details>
  <pre v-else-if="event.type === AgentEventType.CommandOutput" class="output" px-3 py-1 ws-pre-wrap>{{
    event.content
  }}</pre>
  <p v-else-if="event.type === AgentEventType.HostError" class="error" role="alert">{{ event.message }}</p>
  <p v-else-if="event.type === AgentEventType.Compaction" class="muted" text-center>
    — Context compacted · {{ TOKEN_COUNT_FORMAT.format(event.preTokens) }} →
    {{ TOKEN_COUNT_FORMAT.format(event.postTokens) }} tokens —
  </p>
  <p v-else-if="event.type === AgentEventType.TurnResult" class="muted" text-center>
    — {{ event.isError ? event.subtype : "Turn" }} · {{ getDurationSeconds(event.durationMs) }}s ·
    {{ event.numTurns }} requests —
  </p>
  <details v-else-if="event.type === AgentEventType.Unknown" class="folded muted">
    <summary>{{ event.sdkType }}</summary>
    <pre of-x-auto>{{ event.raw }}</pre>
  </details>
</template>

<style scoped>
.user-message {
  background-color: var(--agent-console-panel-edge);
}

.output {
  background-color: var(--agent-console-background);
}

.folded summary {
  color: var(--agent-console-muted);
  cursor: pointer;
}

.muted {
  color: var(--agent-console-muted);
}

.error {
  color: var(--agent-console-error);
}
</style>
