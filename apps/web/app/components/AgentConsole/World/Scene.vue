<script setup lang="ts">
import type { Vector2 } from "three";

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
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

interface Props {
  readMove: (out: Vector2) => void;
}

const { readMove } = defineProps<Props>();
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
  <AgentConsoleWorldPlayer :read-move />
  <AgentConsoleWorldFigure v-for="{ id, isMain, position } of figures" :key="id" :is-main :position />
  <template v-if="currentSessionId">
    <!-- The context vessel fills with the context used, the coins stack with the cost, the pages with the files changed -->
    <AgentConsoleWorldColumn
      :color="isContextNearCompaction ? PaletteColor.Warning : PaletteColor.Info"
      :height="((contextUsage?.percentage ?? 0) / 100) * VESSEL_HEIGHT"
      :position="VESSEL_POSITION"
    />
    <AgentConsoleWorldColumn
      :color="PaletteColor.Accent"
      :height="Math.min(Math.ceil((turnResult?.totalCostUsd ?? 0) / COST_PER_COIN_USD), MAX_STACK_COUNT) * STACK_STEP"
      :position="COINS_POSITION"
    />
    <AgentConsoleWorldColumn
      :color="PaletteColor.Text"
      :height="Math.min(changedFileCount, MAX_STACK_COUNT) * STACK_STEP"
      :position="PAGES_POSITION"
    />
    <AgentConsoleWorldColumn
      :color="pendingPermissionRequests.length > 0 ? PaletteColor.Warning : PaletteColor.Stone"
      :height="1"
      :position="LANTERN_POSITION"
    />
  </template>
</template>
