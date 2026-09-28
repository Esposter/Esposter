<script setup lang="ts">
import { TodoStatusMarkMap } from "@/services/agentConsole/TodoStatusMarkMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SubagentStatus, TodoStatus } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, timelineLanes, todoUpdate } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <ul v-if="todoUpdate && todoUpdate.todos.length > 0" aria-label="Checklist" list-none>
    <li v-for="{ activeForm, content, id, status } of todoUpdate.todos" :key="id">
      {{ TodoStatusMarkMap[status] }} {{ status === TodoStatus.InProgress ? activeForm : content }}
    </li>
  </ul>
  <!-- Each agent's calls side by side: the main agent's lane first, each subagent's beside it in the order it started -->
  <div flex gap-4 of-x-auto>
    <section
      v-for="{ id, status, taskId, title, toolCalls } of timelineLanes"
      :key="id"
      flex
      flex-1
      flex-col
      gap-1
      min-w-0
    >
      <div flex gap-2 items-center>
        <h3 flex-1 min-w-0>
          {{ title }} <span v-if="status" text-muted>· {{ status }}</span>
        </h3>
        <!-- A running subagent or background command stops on its own, as the terminal's task list stops one -->
        <UiButton
          v-if="taskId && (status === SubagentStatus.Running || status === SubagentStatus.Started)"
          @click="sendCommand({ sessionId: currentSessionId, taskId, type: CommandType.StopTask })"
        >
          Stop
        </UiButton>
      </div>
      <p v-if="toolCalls.length === 0" text-muted>No tool calls yet</p>
      <AgentConsolePanelToolCall v-for="toolCall of toolCalls" :key="toolCall.toolUse.id" :tool-call />
    </section>
  </div>
</template>
