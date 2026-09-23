<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { openedPanelType } = storeToRefs(agentConsolePanelStore);
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
const isCwdMenuOpen = ref(false);
const cwdForm = useTemplateRef("cwdForm");
const cwdInput = useTemplateRef("cwdInput");
// Asked on a click, never on load: a permission prompt nobody asked for is one a browser learns to hide
const isNotificationPermissionDefault = ref(
  typeof Notification !== "undefined" && Notification.permission === "default",
);
// A browser global the template cannot reach
const requestNotificationPermission = async () => {
  await Notification.requestPermission();
  isNotificationPermissionDefault.value = Notification.permission === "default";
};

onClickOutside(cwdForm, () => {
  isCwdMenuOpen.value = false;
});
</script>

<template>
  <div flex flex-col gap-2 min-h-0>
    <AgentConsolePanelButton v-if="isNotificationPermissionDefault" self-start @click="requestNotificationPermission()">
      Notify me
    </AgentConsolePanelButton>
    <form
      v-if="status === ConnectionStatus.Connected"
      ref="cwdForm"
      flex
      gap-2
      @submit.prevent="sendCommand({ cwd: editedCwd, type: CommandType.CreateSession })"
    >
      <input
        ref="cwdInput"
        v-model="editedCwd"
        aria-label="Start a session in"
        flex-1
        min-w-0
        placeholder="Start a session in…"
        @focus="isCwdMenuOpen = true"
        @keydown.escape.stop="isCwdMenuOpen = false"
      />
      <AgentConsolePanelPopover
        v-if="isCwdMenuOpen && cwdMenuItems.length > 0"
        placement="bottom-start"
        :reference="cwdInput ?? undefined"
      >
        <AgentConsolePanelMenu
          :items="cwdMenuItems"
          label="Repositories"
          min-h-0
          @keydown.escape.stop="isCwdMenuOpen = false"
          @select="
            (cwd) => {
              editedCwd = cwd;
              isCwdMenuOpen = false;
            }
          "
        />
      </AgentConsolePanelPopover>
      <AgentConsolePanelButton :disabled="!editedCwd" type="submit">New</AgentConsolePanelButton>
    </form>
    <ul list-none flex flex-col gap-1 of-y-auto>
      <li v-for="{ cwd, id, lastActivityAt, state, title } of displaySessions" :key="id" flex gap-2 items-center>
        <button
          :class="{ current: id === currentSessionId }"
          class="session"
          px-2
          text-left
          flex-1
          min-w-0
          cursor-pointer
          hover:brightness-125
          type="button"
          @click="
            () => {
              if (state === SessionState.Closed) sendCommand({ sessionId: id, type: CommandType.Resume });
              else currentSessionId = id;
              openedPanelType = '';
            }
          "
        >
          <span block truncate>{{ title || "New session" }}</span>
          <span class="muted" block truncate>{{ cwd }}</span>
        </button>
        <div flex flex-col items-end>
          <span :style="{ color: SessionStateColorMap[state] }">{{ state }}</span>
          <NuxtTime class="muted" :datetime="lastActivityAt" relative />
        </div>
        <AgentConsolePanelButton @click="sendCommand({ messageUuid: '', sessionId: id, type: CommandType.Fork })">
          Fork
        </AgentConsolePanelButton>
        <AgentConsolePanelButton
          v-if="state !== SessionState.Closed"
          @click="sendCommand({ sessionId: id, type: CommandType.CloseSession })"
        >
          Close
        </AgentConsolePanelButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.session {
  background-color: transparent;
}

.current {
  background-color: color-mix(in srgb, var(--agent-console-accent) 20%, transparent);
}

.muted {
  color: var(--agent-console-muted);
}
</style>
