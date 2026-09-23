<script setup lang="ts">
import { TodoStatusMarkMap } from "@/services/agentConsole/TodoStatusMarkMap";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { TodoStatus } from "agent-console-server/contracts";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { timelineLanes, todoUpdate } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <ul v-if="todoUpdate && todoUpdate.todos.length > 0" aria-label="Checklist" list-none>
    <li v-for="{ activeForm, content, id, status } of todoUpdate.todos" :key="id">
      {{ TodoStatusMarkMap[status] }} {{ status === TodoStatus.InProgress ? activeForm : content }}
    </li>
  </ul>
  <!-- Each agent's calls side by side: the main agent's lane first, each subagent's beside it in the order it started -->
  <div flex gap-4 of-x-auto>
    <section v-for="{ id, status, title, toolCalls } of timelineLanes" :key="id" flex flex-1 flex-col gap-1 min-w-0>
      <h3>
        {{ title }} <span v-if="status" class="muted">· {{ status }}</span>
      </h3>
      <p v-if="toolCalls.length === 0" class="muted">No tool calls yet</p>
      <AgentConsolePanelToolCall v-for="toolCall of toolCalls" :key="toolCall.toolUse.id" :tool-call />
    </section>
  </div>
</template>

<style scoped>
.muted {
  color: var(--agent-console-muted);
}
</style>
