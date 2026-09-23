<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { openedPanelType } = storeToRefs(agentConsolePanelStore);
</script>

<template>
  <UiFrame v-if="openedPanelType" :title="openedPanelType" max-h-full>
    <template #actions>
      <UiButton @click="openedPanelType = ''">Close</UiButton>
    </template>
    <div flex flex-col gap-2 min-h-0 of-y-auto>
      <AgentConsolePanelSessions v-if="openedPanelType === AgentConsolePanelType.Sessions" />
      <AgentConsolePanelTimeline v-else-if="openedPanelType === AgentConsolePanelType.Timeline" />
      <AgentConsolePanelChanges v-else-if="openedPanelType === AgentConsolePanelType.Changes" />
      <AgentConsolePanelUsage v-else />
    </div>
  </UiFrame>
</template>
