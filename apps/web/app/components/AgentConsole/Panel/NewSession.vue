<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getConnectionName } from "@/services/agentConsole/getConnectionName";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connectedConnections } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { sessions } = storeToRefs(agentConsoleSessionStore);
const editedCwd = ref("");
// The host the session starts on, asked only when more than one is reached: the first reached until the reader picks
const selectedConnectionId = ref("");
const connectionId = computed({
  get: () =>
    connectedConnections.value.some(({ id }) => id === selectedConnectionId.value)
      ? selectedConnectionId.value
      : (connectedConnections.value.at(0)?.id ?? ""),
  set: (newConnectionId) => {
    selectedConnectionId.value = newConnectionId;
  },
});
const connectionMenuItems = computed(() =>
  connectedConnections.value.map(({ address, id }): UiSelectItem<string> => ({
    meaning: UiIconMeaning.Device,
    title: getConnectionName(address),
    value: id,
  })),
);
// The repositories a session was already run in, offered while one is being typed
const cwdMenuItems = computed(() =>
  Array.from(
    new Set(sessions.value.map(({ cwd }) => cwd).filter((cwd) => cwd && cwd.includes(editedCwd.value))),
    (cwd) => ({ title: cwd, value: cwd }),
  ),
);
const cwdTextField = useTemplateRef("cwdTextField");
</script>

<template>
  <!-- The conversation it starts opens as soon as the host has it -->
  <UiForm
    v-if="connectedConnections.length > 0"
    @submit="
      () => {
        sendCommand({ cwd: editedCwd, type: CommandType.CreateSession }, connectionId);
        consolePanelType = AgentConsolePanelType.Conversation;
      }
    "
  >
    <div flex flex-wrap gap-2 items-end>
      <UiSelect v-if="connectionMenuItems.length > 1" v-model="connectionId" :items="connectionMenuItems" label="On" />
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
</template>
