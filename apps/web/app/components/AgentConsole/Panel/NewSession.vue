<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { sessions } = storeToRefs(agentConsoleSessionStore);
const editedCwd = ref("");
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
    v-if="status === ConnectionStatus.Connected"
    @submit="
      () => {
        sendCommand({ cwd: editedCwd, type: CommandType.CreateSession });
        consolePanelType = AgentConsolePanelType.Conversation;
      }
    "
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
</template>
