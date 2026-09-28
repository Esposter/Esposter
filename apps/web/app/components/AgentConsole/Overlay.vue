<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { AgentConsolePanelMenuItems } from "@/services/agentConsole/AgentConsolePanelMenuItems";
import { getConnectionName } from "@/services/agentConsole/getConnectionName";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connectionStatuses, pairing, status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType, isConsoleExpanded, isConsoleOpen } = storeToRefs(agentConsolePanelStore);
const { openConsole } = agentConsolePanelStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, isTurnRunning, pendingPermissionRequests } = storeToRefs(agentConsoleSessionStore);
useAgentConsoleCommands();
// A question from the agent is never left waiting where nobody looks
watch(
  () => pendingPermissionRequests.value.length,
  async (newLength, oldLength) => {
    if (newLength > oldLength) await openConsole(AgentConsolePanelType.Conversation);
  },
);
</script>

<template>
  <!-- Escape closes it, unless a turn is running: then Escape is the terminal's, and stops the turn -->
  <UiDialog
    v-model="isConsoleOpen"
    v-model:is-expanded="isConsoleExpanded"
    is-expandable
    title="Console"
    :placement="UiDialogPlacement.Sheet"
    @keydown.esc="
      (event: KeyboardEvent) => {
        if (!isTurnRunning) return;
        event.preventDefault();
        sendCommand({ sessionId: currentSessionId, type: CommandType.Interrupt });
      }
    "
  >
    <!-- The world needs no host; the console is where one is paired, the first time it is opened without one -->
    <div v-if="status === ConnectionStatus.Unpaired" p-3 of-y-auto>
      <AgentConsolePanelPairing />
    </div>
    <div v-else p-3 flex flex-1 flex-col gap-2 min-h-0>
      <p v-if="pairing" role="status">
        Connecting to {{ getConnectionName(pairing.address) }}… If your browser asks to open it, allow it.
      </p>
      <!-- Each host not reached says so on its own, so one stopping leaves the others' sessions in reach -->
      <div
        v-for="{ connection, status: connectionStatus } of connectionStatuses.filter(
          ({ status: connectionStatus }) => connectionStatus !== ConnectionStatus.Connected,
        )"
        :key="connection.id"
        role="status"
        flex
        gap-2
        items-center
      >
        <p :class="{ 'text-warning': connectionStatus === ConnectionStatus.Disconnected }" flex-1>
          {{ getConnectionName(connection.address) }}
          <template v-if="connectionStatus === ConnectionStatus.Connecting">is connecting…</template>
          <template v-else-if="connectionStatus === ConnectionStatus.Disconnected">
            is not answering. Reconnecting — start it again and the page picks up where it was.
          </template>
          <template v-else>was stopped from its window, and its sessions with it.</template>
        </p>
        <AgentConsolePanelConnectionRestartButton :connection :status="connectionStatus" />
      </div>
      <!-- The tab list and the one panel shown, which takes the height left under it -->
      <div rows="[auto_1fr]" flex-1 grid min-h-0>
        <UiTabs v-model="consolePanelType" :items="AgentConsolePanelMenuItems" label="Console">
          <template #default="{ value }">
            <div v-if="value === AgentConsolePanelType.Conversation" flex flex-col gap-2 h-full>
              <!-- With no session open it starts one, the list of the rest being the Sessions tab's -->
              <AgentConsolePanelNewSession v-if="!currentSessionId" />
              <template v-else>
                <AgentConsolePanelConversation flex-1 />
                <!-- A request waiting on a verdict stays open until it has one, as the terminal's prompt does -->
                <AgentConsolePanelPermission
                  v-for="permissionRequest of pendingPermissionRequests"
                  :key="permissionRequest.requestId"
                  :permission-request
                />
                <AgentConsolePanelComposer />
              </template>
            </div>
            <div v-else flex flex-col gap-2 h-full of-y-auto>
              <AgentConsolePanelSessions v-if="value === AgentConsolePanelType.Sessions" />
              <AgentConsolePanelTimeline v-else-if="value === AgentConsolePanelType.Timeline" />
              <AgentConsolePanelChanges v-else-if="value === AgentConsolePanelType.Changes" />
              <AgentConsolePanelUsage v-else-if="value === AgentConsolePanelType.Usage" />
              <AgentConsolePanelShell v-else />
            </div>
          </template>
        </UiTabs>
      </div>
    </div>
  </UiDialog>
</template>
