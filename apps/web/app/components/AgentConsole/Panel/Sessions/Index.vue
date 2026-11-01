<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connectionStatuses } = storeToRefs(agentConsoleConnectionStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { sessions } = storeToRefs(agentConsoleSessionStore);
// Each host's sessions under it, the most recently active first
const connectionGroups = computed(() =>
  connectionStatuses.value.map(({ connection, status }) => ({
    connection,
    sessions: sessions.value
      .filter(({ connectionId }) => connectionId === connection.id)
      .toSorted(
        (firstSession, secondSession) => secondSession.lastActivityAt.getTime() - firstSession.lastActivityAt.getTime(),
      ),
    status,
  })),
);
// Asked on a click, never on load: a permission prompt nobody asked for is one a browser learns to hide
const isNotificationPermissionDefault = ref(
  typeof Notification !== "undefined" && Notification.permission === "default",
);
// A browser global the template cannot reach
const requestNotificationPermission = async () => {
  await Notification.requestPermission();
  isNotificationPermissionDefault.value = Notification.permission === "default";
};
</script>

<template>
  <div flex flex-col gap-2 min-h-0>
    <UiButton v-if="isNotificationPermissionDefault" self-start @click="requestNotificationPermission()">
      Notify me
    </UiButton>
    <AgentConsolePanelNewSession />
    <div flex flex-col gap-3 of-y-auto>
      <AgentConsolePanelSessionsConnection
        v-for="{ connection, sessions: connectionSessions, status } of connectionGroups"
        :key="connection.id"
        :connection
        :sessions="connectionSessions"
        :status
      />
      <AgentConsolePanelAddConnection />
    </div>
  </div>
</template>
