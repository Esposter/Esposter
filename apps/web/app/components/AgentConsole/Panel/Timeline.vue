<script setup lang="ts">
import { TodoStatusMarkMap } from "@/services/agentConsole/TodoStatusMarkMap";
import { getToolWorldObjectType } from "@/services/agentConsole/world/getToolWorldObjectType";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { TodoStatus } from "agent-console-server/contracts";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { timelineWorldObjectType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { timelineLanes, todoUpdate } = storeToRefs(agentConsoleSessionStore);
// Each lane's calls, or only those made at the station a player stood at to open the timeline
const displayTimelineLanes = computed(() =>
  timelineWorldObjectType.value
    ? timelineLanes.value.map((timelineLane) => ({
        ...timelineLane,
        toolCalls: timelineLane.toolCalls.filter(
          ({ toolUse }) => getToolWorldObjectType(toolUse.name) === timelineWorldObjectType.value,
        ),
      }))
    : timelineLanes.value,
);
</script>

<template>
  <ul v-if="todoUpdate && todoUpdate.todos.length > 0" aria-label="Checklist" list-none>
    <li v-for="{ activeForm, content, id, status } of todoUpdate.todos" :key="id">
      {{ TodoStatusMarkMap[status] }} {{ status === TodoStatus.InProgress ? activeForm : content }}
    </li>
  </ul>
  <p v-if="timelineWorldObjectType" flex flex-wrap gap-2 items-center>
    The calls made at the {{ timelineWorldObjectType.toLowerCase() }}
    <UiButton @click="timelineWorldObjectType = ''">Show every call</UiButton>
  </p>
  <!-- Each agent's calls side by side: the main agent's lane first, each subagent's beside it in the order it started -->
  <div flex gap-4 of-x-auto>
    <section
      v-for="{ id, status, title, toolCalls } of displayTimelineLanes"
      :key="id"
      flex
      flex-1
      flex-col
      gap-1
      min-w-0
    >
      <h3>
        {{ title }} <span v-if="status" text-muted>· {{ status }}</span>
      </h3>
      <p v-if="toolCalls.length === 0" text-muted>No tool calls yet</p>
      <AgentConsolePanelToolCall v-for="toolCall of toolCalls" :key="toolCall.toolUse.id" :tool-call />
    </section>
  </div>
</template>
