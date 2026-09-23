<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand, unpair } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
const displaySessions = computed(() =>
  sessions.value.toSorted((first, second) => second.lastActivityAt.getTime() - first.lastActivityAt.getTime()),
);
// The repositories a session was already run in, offered first when starting another
const cwds = computed(() => [...new Set(sessions.value.map(({ cwd }) => cwd).filter(Boolean))]);
const editedCwd = ref("");
// Asked on a click, never on load: a permission prompt nobody asked for is one a browser learns to hide
const isNotificationPermissionDefault = ref(
  typeof Notification !== "undefined" && Notification.permission === "default",
);
const requestNotificationPermission = async () => {
  await Notification.requestPermission();
  isNotificationPermissionDefault.value = Notification.permission === "default";
};
</script>

<template>
  <div p-2 flex gap-2 items-center>
    <v-chip :color="status === ConnectionStatus.Connected ? 'success' : 'warning'" size="small">{{ status }}</v-chip>
    <StyledTooltipIconButton
      v-if="isNotificationPermissionDefault"
      :button-props="{ size: 'small' }"
      icon="mdi-bell-outline"
      text="Notify me when a hidden session needs me"
      @click="requestNotificationPermission()"
    />
    <StyledTooltipIconButton
      v-if="status !== ConnectionStatus.Unpaired"
      :button-props="{ size: 'small' }"
      icon="mdi-link-off"
      ml-a
      text="Unpair this host"
      @click="unpair()"
    />
  </div>
  <v-form
    v-if="status === ConnectionStatus.Connected"
    px-2
    flex
    gap-1
    @submit.prevent="sendCommand({ cwd: editedCwd, type: CommandType.CreateSession })"
  >
    <v-combobox v-model="editedCwd" density="compact" :items="cwds" label="Start a session in" />
    <StyledTooltipIconButton
      :button-props="{ disabled: !editedCwd, size: 'small' }"
      icon="mdi-plus"
      text="New session"
      type="submit"
    />
  </v-form>
  <v-list flex-1 of-y-auto density="compact">
    <v-list-item
      v-for="{ cwd, id, lastActivityAt, state, title } of displaySessions"
      :key="id"
      :active="id === currentSessionId"
      :subtitle="cwd"
      :title="title || 'New session'"
      @click="
        state === SessionState.Closed
          ? sendCommand({ sessionId: id, type: CommandType.Resume })
          : (currentSessionId = id)
      "
    >
      <template #append>
        <div flex flex-col items-end>
          <v-chip :color="SessionStateColorMap[state]" size="x-small">{{ state }}</v-chip>
          <NuxtTime :datetime="lastActivityAt" relative op-medium-emphasis text-label-small />
        </div>
        <StyledTooltipMenuIconButton :button-props="{ size: 'small' }" icon="mdi-dots-vertical" text="Session actions">
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-source-fork"
              title="Fork"
              @click="sendCommand({ messageUuid: '', sessionId: id, type: CommandType.Fork })"
            />
            <v-list-item
              v-if="state !== SessionState.Closed"
              prepend-icon="mdi-close"
              title="Close"
              @click="sendCommand({ sessionId: id, type: CommandType.CloseSession })"
            />
          </v-list>
        </StyledTooltipMenuIconButton>
      </template>
    </v-list-item>
  </v-list>
</template>
