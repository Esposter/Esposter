<script setup lang="ts">
import { getTimelineLanes } from "@/services/agentConsole/getTimelineLanes";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { events, toolCalls } = storeToRefs(agentConsoleSessionStore);
const lanes = computed(() => getTimelineLanes(toolCalls.value, events.value));
</script>

<template>
  <div flex flex-col gap-4>
    <div v-for="lane of lanes" :key="lane.id">
      <div px-2 pb-1 flex gap-2 items-center>
        <span text-title-small>{{ lane.title }}</span>
        <v-chip v-if="lane.status" size="x-small">{{ lane.status }}</v-chip>
      </div>
      <div v-if="lane.toolCalls.length === 0" px-2 op-medium-emphasis text-body-small>No tool calls yet</div>
      <v-expansion-panels v-else variant="accordion" multiple>
        <AgentConsoleWorkToolCall v-for="toolCall of lane.toolCalls" :key="toolCall.toolUse.id" :tool-call />
      </v-expansion-panels>
    </div>
  </div>
</template>
