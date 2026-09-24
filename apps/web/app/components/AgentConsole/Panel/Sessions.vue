<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
const displaySessions = computed(() =>
  sessions.value.toSorted((first, second) => second.lastActivityAt.getTime() - first.lastActivityAt.getTime()),
);
const editedCwd = ref("");
// The repositories a session was already run in, offered while one is being typed
const cwdMenuItems = computed(() =>
  Array.from(
    new Set(sessions.value.map(({ cwd }) => cwd).filter((cwd) => cwd && cwd.includes(editedCwd.value))),
    (cwd) => ({
      title: cwd,
      value: cwd,
    }),
  ),
);
const cwdTextField = useTemplateRef("cwdTextField");
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
    <UiForm
      v-if="status === ConnectionStatus.Connected"
      @submit="sendCommand({ cwd: editedCwd, type: CommandType.CreateSession })"
    >
      <div flex gap-2 items-end>
        <UiTextField ref="cwdTextField" v-model="editedCwd" label="Start a session in" flex-1 min-w-0 />
        <UiButton :disabled="!editedCwd" type="submit">New</UiButton>
      </div>
      <UiSuggestions
        :field="cwdTextField?.element ?? undefined"
        :items="cwdMenuItems"
        label="Repositories"
        @select="
          (cwd) => {
            editedCwd = cwd;
          }
        "
      />
    </UiForm>
    <ul list-none flex flex-col gap-1 of-y-auto>
      <li v-for="{ cwd, id, lastActivityAt, state, title } of displaySessions" :key="id" flex gap-2 items-center>
        <button
          :aria-current="id === currentSessionId || undefined"
          class="aria-[current=true]:bg-accent/20"
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
