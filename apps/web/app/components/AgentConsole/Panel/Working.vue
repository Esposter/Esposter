<script setup lang="ts">
import { AgentConsoleTips } from "@/services/agentConsole/AgentConsoleTips";
import { ELAPSED_TICK_MS } from "@/services/agentConsole/constants";
import { WorkingVerbs } from "@/services/agentConsole/WorkingVerbs";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { takeOne } from "@esposter/shared";
import { AgentEventType, SessionState } from "agent-console-server/contracts";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { conversationEvents, sessionState } = storeToRefs(agentConsoleSessionStore);
// Mounted once per turn, so the verb and the tip hold for the turn and change with the next
const verb = takeOne(WorkingVerbs, Math.floor(Math.random() * WorkingVerbs.length));
const tip = takeOne(AgentConsoleTips, Math.floor(Math.random() * AgentConsoleTips.length));
const now = useNow({ scheduler: (callback) => useIntervalFn(callback, ELAPSED_TICK_MS) });
// The turn started with the prompt that began it, so a page opened mid-turn still counts from there
const startedAt = computed(
  () => conversationEvents.value.findLast(({ type }) => type === AgentEventType.UserMessage)?.createdAt ?? now.value,
);
// Never below zero, when the host's clock runs a little ahead of this one
const elapsedSeconds = computed(() =>
  Math.max(
    0,
    Math.floor(
      Temporal.Duration.from({ milliseconds: now.value.getTime() - startedAt.value.getTime() }).total("seconds"),
    ),
  ),
);
</script>

<template>
  <div role="status" flex flex-col>
    <span>
      <AgentConsolePanelSpinner />
      {{ sessionState === SessionState.Compacting ? "Compacting the conversation" : `${verb}…` }}
      <span class="muted"> ({{ elapsedSeconds }}s · Escape to interrupt) </span>
    </span>
    <span class="muted" pl-4>Tip: {{ tip }}</span>
  </div>
</template>

<style scoped>
.muted {
  color: var(--agent-console-muted);
}
</style>
