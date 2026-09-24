<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openConsole } = agentConsolePanelStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const {
  avatar,
  contextUsage,
  currentSession,
  currentSessionId,
  isContextNearCompaction,
  pendingPermissionRequests,
  sessionState,
  turnResult,
} = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <!-- What describes the session, and the one way into the console for a pointer or a touch, its key written on it -->
  <header px-2 py-1 bg="panel/85" flex flex-wrap gap-2 items-center>
    <template v-if="currentSessionId">
      <span v-if="avatar" flex gap-2 items-center>
        <UiAvatar :name="avatar" />
        {{ avatar }}
      </span>
      <span truncate>{{ currentSession?.title || "New session" }}</span>
      <span v-if="sessionState" :style="{ color: SessionStateColorMap[sessionState] }">{{ sessionState }}</span>
      <span v-if="contextUsage" :class="{ 'text-warning': isContextNearCompaction }">
        {{ Math.round(contextUsage.percentage) }}% context
      </span>
      <span v-if="turnResult">${{ turnResult.totalCostUsd.toFixed(2) }}</span>
    </template>
    <span v-else-if="status === ConnectionStatus.Unpaired">Not paired with a host</span>
    <span v-else>No session open</span>
    <UiButton ml-a @click="openConsole(AgentConsolePanelType.Conversation)">
      <UiIcon
        v-if="pendingPermissionRequests.length > 0"
        label="A permission request is waiting"
        :meaning="UiIconMeaning.Warning"
        text-warning
      />
      Console
      <UiShortcut shortcut="t" />
    </UiButton>
  </header>
</template>
