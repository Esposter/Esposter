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
  <!-- Every message runs the panel's full width with no box of its own, as the terminal prints it: a prompt is told -->
  <!-- Apart by its mark, and each message's actions float over its corner while it is hovered or focused -->
  <div v-if="event.type === AgentEventType.UserMessage" class="group" ws-pre-wrap relative>
    <span class="prompt-mark">›</span> {{ event.text }}
    <span v-if="event.attachmentCount > 0" class="muted">[{{ event.attachmentCount }} attached]</span>
    <AgentConsolePanelMessageActions is-prompt :message-uuid="event.messageUuid" :text="event.text" />
  </div>
  <div v-else-if="event.type === AgentEventType.AssistantMessage" class="group" relative>
    <AgentConsoleMarkdown :source="event.text" />
    <AgentConsolePanelMessageActions :message-uuid="event.messageUuid" :text="event.text" />
  </div>
  <AgentConsolePanelThinking v-else-if="event.type === AgentEventType.Thinking" :text="event.thinking" />
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
  <p v-else-if="event.type === AgentEventType.FileRewind" class="muted" text-center>
    — Files rewound · {{ event.filePaths.length }} files · +{{ event.insertions }} −{{ event.deletions }} —
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
.prompt-mark {
  color: var(--agent-console-accent);
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
