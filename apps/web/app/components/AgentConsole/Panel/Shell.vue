<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { INITIAL_SHELL_SIZE } from "@/services/agentConsole/constants";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleShellStore } from "@/store/agentConsole/shell";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSession } = storeToRefs(agentConsoleSessionStore);
const agentConsoleShellStore = useAgentConsoleShellStore();
const { currentShellId, shells } = storeToRefs(agentConsoleShellStore);
const sessionShells = computed(() => shells.value.filter(({ sessionId }) => sessionId === currentSession.value?.id));
// The shell last opened or picked, while it is this session's; otherwise the session's first
const shownShell = computed(
  () => sessionShells.value.find(({ id }) => id === currentShellId.value) ?? sessionShells.value.at(0),
);
const openShell = () => {
  if (!currentSession.value) return;
  const { cwd, id } = currentSession.value;
  sendCommand({ ...INITIAL_SHELL_SIZE, cwd, sessionId: id, type: CommandType.OpenShell });
};
// The tab opens on a shell, as the Code tab's terminal does, rather than on a button to start one
onMounted(() => {
  if (sessionShells.value.length === 0) openShell();
});
</script>

<template>
  <p v-if="!currentSession" text-muted>Open a session to start a shell in its folder.</p>
  <div v-else flex flex-col gap-2 h-full min-h-0>
    <div role="tablist" aria-label="Shells" flex flex-wrap gap-1 items-center>
      <div v-for="({ id }, index) of sessionShells" :key="id" flex items-center>
        <UiButton
          :aria-selected="id === shownShell?.id"
          role="tab"
          :variant="id === shownShell?.id ? undefined : UiButtonVariant.Quiet"
          @click="currentShellId = id"
        >
          Shell {{ index + 1 }}
        </UiButton>
        <UiIconButton
          :label="`Close shell ${index + 1}`"
          :meaning="UiIconMeaning.Close"
          :variant="UiButtonVariant.Quiet"
          @click="sendCommand({ shellId: id, type: CommandType.CloseShell })"
        />
      </div>
      <UiIconButton
        label="New shell"
        :meaning="UiIconMeaning.New"
        :variant="UiButtonVariant.Quiet"
        @click="openShell()"
      />
    </div>
    <AgentConsolePanelShellTerminal v-if="shownShell" :key="shownShell.id" :shell-id="shownShell.id" flex-1 min-h-0 />
  </div>
</template>
