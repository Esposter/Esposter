<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AgentConsolePanelMenuItems } from "@/services/agentConsole/AgentConsolePanelMenuItems";
import {
  AGENT_CONSOLE_DEFAULT_HEIGHT_RATIO,
  AGENT_CONSOLE_ID,
  AGENT_CONSOLE_MIN_HEIGHT,
} from "@/services/agentConsole/constants";
import { getConnectionName } from "@/services/agentConsole/getConnectionName";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connectionStatuses, pairing, status } = storeToRefs(agentConsoleConnectionStore);
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consoleHeight, consolePanelType, isConsoleExpanded, isConsoleOpen } = storeToRefs(agentConsolePanelStore);
const { onConsoleFocusRequest, openConsole } = agentConsolePanelStore;
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
const sheet = useTemplateRef("sheet");
const { height: windowHeight } = useWindowSize();
// The height the reader dragged it to, or a little over half the window until they have. The sheet never stands taller
// Than the world it sits in, whatever was saved on a taller window
const height = computed({
  get: () => consoleHeight.value || Math.round(windowHeight.value * AGENT_CONSOLE_DEFAULT_HEIGHT_RATIO),
  set: (newHeight) => {
    consoleHeight.value = newHeight;
  },
});
// Opening moves focus into the sheet, to the control that asks for it with autofocus — the composer — or else to the
// Sheet itself, so the keys are the console's until the reader clicks back into the world
onConsoleFocusRequest(async () => {
  await nextTick();
  const autofocusElement = sheet.value?.querySelector("[autofocus]");
  if (autofocusElement instanceof HTMLElement) autofocusElement.focus();
  else sheet.value?.focus();
});
</script>

<template>
  <!-- Docked along the foot of the world, above the bar, rather than a dialog over it: it stands over the world's lower
    Part, as tall as the reader drags its top edge, and never resizes the world, so the room's labels above it and the
    Bar's session under it stay in view and nothing shifts. Expanded, it covers the whole world. Escape closes it, unless a turn is running:
    Then Escape is the terminal's, and stops the turn -->
  <section
    v-if="isConsoleOpen"
    ref="sheet"
    aria-label="Console"
    :id="AGENT_CONSOLE_ID"
    :class="isConsoleExpanded ? 'inset-0' : 'inset-x-0 bottom-0 max-h-full'"
    :style="isConsoleExpanded ? undefined : { height: `${height}px` }"
    tabindex="-1"
    flex
    flex-col
    absolute
    z-1
    ui-lifted
    focus-visible:outline-hidden
    @keydown.ctrl.b="
      (event: KeyboardEvent) => {
        if (!isTurnRunning) return;
        event.preventDefault();
        sendCommand({ sessionId: currentSessionId, type: CommandType.BackgroundTasks });
      }
    "
    @keydown.esc="
      (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (isTurnRunning) sendCommand({ sessionId: currentSessionId, type: CommandType.Interrupt });
        else isConsoleOpen = false;
      }
    "
  >
    <UiResizeHandle
      v-if="!isConsoleExpanded"
      v-model="height"
      is-reversed
      is-vertical
      label="Resize the console"
      :max="windowHeight"
      :min="AGENT_CONSOLE_MIN_HEIGHT"
    />
    <header px-3 py-2 flex gap-2 ui-bar items-center>
      <h2 text-heading-color flex-1 truncate>Console</h2>
      <UiIconButton
        :aria-pressed="isConsoleExpanded"
        label="Full screen"
        :meaning="isConsoleExpanded ? UiIconMeaning.Collapse : UiIconMeaning.Expand"
        :variant="UiButtonVariant.Quiet"
        @click="isConsoleExpanded = !isConsoleExpanded"
      />
      <UiIconButton
        label="Close"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="isConsoleOpen = false"
      />
    </header>
    <!-- The world needs no host; the console is where one is paired, the first time it is opened without one -->
    <div v-if="status === ConnectionStatus.Unpaired" p-3 flex-1 min-h-0 of-y-auto>
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
      <!-- The tab list and the one panel shown, which takes the height left under it and scrolls what does not fit -->
      <UiTabs v-model="consolePanelType" is-filling :items="AgentConsolePanelMenuItems" label="Console" flex-1>
        <template #default="{ value }">
          <div v-if="value === AgentConsolePanelType.Conversation" flex flex-col gap-2 h-full>
            <!-- With no session open it starts one, the list of the rest being the Sessions tab's -->
            <AgentConsolePanelNewSession v-if="!currentSessionId" />
            <template v-else>
              <!-- Keeps a few lines of the conversation however short the console is: past that the panel scrolls -->
              <AgentConsolePanelConversation flex-1 min-h-32 />
              <!-- A request waiting on a verdict stays open until it has one, as the terminal's prompt does -->
              <AgentConsolePanelPermission
                v-for="permissionRequest of pendingPermissionRequests"
                :key="permissionRequest.requestId"
                :permission-request
              />
              <AgentConsolePanelComposer />
            </template>
          </div>
          <div v-else flex flex-col gap-2 h-full>
            <AgentConsolePanelSessions v-if="value === AgentConsolePanelType.Sessions" />
            <AgentConsolePanelTimeline v-else-if="value === AgentConsolePanelType.Timeline" />
            <AgentConsolePanelChanges v-else-if="value === AgentConsolePanelType.Changes" />
            <AgentConsolePanelUsage v-else-if="value === AgentConsolePanelType.Usage" />
            <AgentConsolePanelShell v-else />
          </div>
        </template>
      </UiTabs>
    </div>
  </section>
</template>
