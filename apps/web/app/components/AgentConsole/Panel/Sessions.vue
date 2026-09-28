<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getConnectionName } from "@/services/agentConsole/getConnectionName";
import { getResumeCommand } from "@/services/agentConsole/getResumeCommand";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connectionStatuses } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand, unpair } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
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
      <section
        v-for="{ connection, sessions: connectionSessions, status } of connectionGroups"
        :key="connection.id"
        flex
        flex-col
        gap-1
      >
        <header flex gap-2 items-center>
          <h3 fw-bold flex-1 truncate>{{ getConnectionName(connection.address) }}</h3>
          <AgentConsolePanelConnectionStatus :status />
          <AgentConsolePanelConnectionRestartButton :connection :status />
          <UiButton @click="unpair(connection.id)">Remove</UiButton>
        </header>
        <ul list-none flex flex-col gap-1>
          <li v-for="{ cwd, id, lastActivityAt, state, title } of connectionSessions" :key="id" flex gap-2 items-center>
            <button
              :aria-current="id === currentSessionId || undefined"
              type="button"
              ui-item
              flex-1
              min-w-0
              @click="
                () => {
                  if (state === SessionState.Closed) sendCommand({ sessionId: id, type: CommandType.Resume });
                  else currentSessionId = id;
                  consolePanelType = AgentConsolePanelType.Conversation;
                }
              "
            >
              <UiItemContent :description="cwd" :meaning="UiIconMeaning.Terminal" :title="title || 'New session'" />
            </button>
            <div flex flex-col items-end>
              <span :style="{ color: SessionStateColorMap[state] }">{{ state }}</span>
              <NuxtTime text-muted :datetime="lastActivityAt" relative />
            </div>
            <!-- The terminal's own resume picker leaves out a session the page started, so its command is copied instead -->
            <UiCopyButton label="Copy the command that resumes it in a terminal" :source="getResumeCommand(cwd, id)" />
            <UiButton @click="sendCommand({ messageUuid: '', sessionId: id, type: CommandType.Fork })"> Fork </UiButton>
            <UiButton
              v-if="state !== SessionState.Closed"
              @click="sendCommand({ sessionId: id, type: CommandType.CloseSession })"
            >
              Close
            </UiButton>
          </li>
        </ul>
      </section>
      <AgentConsolePanelAddConnection />
    </div>
  </div>
</template>
