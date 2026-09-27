<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
const displaySessions = computed(() =>
  sessions.value.toSorted(
    (firstSession, secondSession) => secondSession.lastActivityAt.getTime() - firstSession.lastActivityAt.getTime(),
  ),
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
    <ul list-none flex flex-col gap-1 of-y-auto>
      <li v-for="{ cwd, id, lastActivityAt, state, title } of displaySessions" :key="id" flex gap-2 items-center>
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
        <UiButton @click="sendCommand({ messageUuid: '', sessionId: id, type: CommandType.Fork })"> Fork </UiButton>
        <UiButton
          v-if="state !== SessionState.Closed"
          @click="sendCommand({ sessionId: id, type: CommandType.CloseSession })"
        >
          Close
        </UiButton>
      </li>
    </ul>
  </div>
</template>
