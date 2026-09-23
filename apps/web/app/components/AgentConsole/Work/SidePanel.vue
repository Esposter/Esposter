<script setup lang="ts">
import { SidePanelTab, SidePanelTabs } from "@/models/agentConsole/SidePanelTab";

const tab = ref(SidePanelTab.Timeline);
</script>

<template>
  <AgentConsoleWorkTodoList />
  <v-tabs v-model="tab" grow>
    <v-tab v-for="value of SidePanelTabs" :key="value" :text="value" :value />
  </v-tabs>
  <div p-2 flex-1 of-y-auto>
    <AgentConsoleWorkTimeline v-if="tab === SidePanelTab.Timeline" />
    <AgentConsoleWorkChanges v-else />
  </div>
</template>
