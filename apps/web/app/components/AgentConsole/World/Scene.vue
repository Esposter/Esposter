<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import {
  COINS_POSITION,
  COST_PER_COIN_USD,
  LANTERN_POSITION,
  MAX_STACK_COUNT,
  PAGES_POSITION,
  STACK_STEP,
  VESSEL_HEIGHT,
  VESSEL_POSITION,
} from "@/services/agentConsole/world/constants";
import { toWorldFigures } from "@/services/agentConsole/world/toWorldFigures";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { openedPanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const {
  contextUsage,
  currentSessionId,
  fileEdits,
  isContextNearCompaction,
  pendingPermissionRequests,
  timelineLanes,
  turnResult,
} = storeToRefs(agentConsoleSessionStore);
const figures = computed(() =>
  currentSessionId.value ? toWorldFigures(timelineLanes.value, pendingPermissionRequests.value.length > 0) : [],
);
const changedFileCount = computed(() => new Set(fileEdits.value.map(({ filePath }) => filePath)).size);
</script>

<template>
  <AgentConsoleWorldRoom />
  <AgentConsoleWorldFigure v-for="{ id, isMain, position } of figures" :key="id" :is-main :position />
  <template v-if="currentSessionId">
    <!-- The context vessel fills with the context used, the coins stack with the cost, the pages with the files changed -->
    <AgentConsoleWorldColumn
      :color="isContextNearCompaction ? PaletteColor.Warning : PaletteColor.Info"
      :height="((contextUsage?.percentage ?? 0) / 100) * VESSEL_HEIGHT"
      :position="VESSEL_POSITION"
      @click="openedPanelType = AgentConsolePanelType.Usage"
    />
    <AgentConsoleWorldColumn
      :color="PaletteColor.Accent"
      :height="Math.min(Math.ceil((turnResult?.totalCostUsd ?? 0) / COST_PER_COIN_USD), MAX_STACK_COUNT) * STACK_STEP"
      :position="COINS_POSITION"
      @click="openedPanelType = AgentConsolePanelType.Usage"
    />
    <AgentConsoleWorldColumn
      :color="PaletteColor.Text"
      :height="Math.min(changedFileCount, MAX_STACK_COUNT) * STACK_STEP"
      :position="PAGES_POSITION"
      @click="openedPanelType = AgentConsolePanelType.Changes"
    />
    <AgentConsoleWorldColumn
      :color="pendingPermissionRequests.length > 0 ? PaletteColor.Warning : PaletteColor.Stone"
      :height="1"
      :position="LANTERN_POSITION"
    />
  </template>
</template>
