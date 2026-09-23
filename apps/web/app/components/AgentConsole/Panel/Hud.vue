<script setup lang="ts">
import { AgentConsolePanelMenuItems } from "@/models/agentConsole/AgentConsolePanelType";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useLayoutStore } from "@/store/layout";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { unpair } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isWorldExpanded, openedPanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { contextUsage, currentSession, currentSessionId, isContextNearCompaction, sessionState, turnResult } =
  storeToRefs(agentConsoleSessionStore);
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
</script>

<template>
  <!-- Every object in the world that opens a panel has its button here, so the keyboard and a screen reader reach -->
  <!-- All of it; the door's way out is the browser's own back. Unpairing sits here too, the one bar shown whenever -->
  <!-- The page is paired -->
  <nav class="hud" aria-label="Agent console" px-2 py-1 flex flex-wrap gap-2 items-center>
    <template v-if="currentSessionId">
      <span truncate>{{ currentSession?.title || "New session" }}</span>
      <span v-if="sessionState" :style="{ color: SessionStateColorMap[sessionState] }">{{ sessionState }}</span>
      <span v-if="contextUsage" :class="{ 'text-warning': isContextNearCompaction }">
        {{ Math.round(contextUsage.percentage) }}% context
      </span>
      <span v-if="turnResult">${{ turnResult.totalCostUsd.toFixed(2) }}</span>
    </template>
    <span v-else>No session open</span>
    <div ml-a flex flex-wrap gap-1>
      <!-- On a narrow screen the panels collapse into one menu -->
      <template v-if="isDesktop">
        <UiButton
          v-for="{ title, value } of AgentConsolePanelMenuItems"
          :key="value"
          :aria-pressed="openedPanelType === value"
          @click="openedPanelType = openedPanelType === value ? '' : value"
        >
          {{ title }}
        </UiButton>
      </template>
      <UiSelect v-else v-model="openedPanelType" :items="AgentConsolePanelMenuItems" label="Panels" />
      <UiButton :aria-pressed="isWorldExpanded" @click="isWorldExpanded = !isWorldExpanded"> World </UiButton>
      <UiButton @click="unpair()">Unpair</UiButton>
    </div>
  </nav>
</template>

<style scoped>
.hud {
  background-color: color-mix(in srgb, var(--ui-panel) 85%, transparent);
}
</style>
