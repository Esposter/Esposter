<script setup lang="ts">
import type { ConnectionSessionSummary } from "@/models/agentConsole/ConnectionSessionSummary";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getResumeCommand } from "@/services/agentConsole/getResumeCommand";
import { SessionStateColorMap } from "@/services/agentConsole/SessionStateColorMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, SessionState } from "agent-console-server/contracts";

interface Props {
  session: ConnectionSessionSummary;
}

const { session } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <li flex gap-2 items-center>
    <button
      :aria-current="session.id === currentSessionId || undefined"
      type="button"
      ui-item
      flex-1
      min-w-0
      @click="
        () => {
          if (session.state === SessionState.Closed) sendCommand({ sessionId: session.id, type: CommandType.Resume });
          else currentSessionId = session.id;
          consolePanelType = AgentConsolePanelType.Conversation;
        }
      "
    >
      <UiItemContent
        :description="session.cwd"
        :meaning="UiIconMeaning.Terminal"
        :title="session.title || 'New session'"
      />
    </button>
    <div flex flex-col items-end>
      <span :style="{ color: SessionStateColorMap[session.state] }">{{ session.state }}</span>
      <NuxtTime text-muted :datetime="session.lastActivityAt" relative />
    </div>
    <!-- The terminal's own resume picker leaves out a session the page started, so its command is
         Copied instead -->
    <UiCopyButton
      label="Copy the command that resumes it in a terminal"
      :source="getResumeCommand(session.cwd, session.id)"
    />
    <UiButton
      @click="sendCommand({ isSideChat: false, messageUuid: '', sessionId: session.id, type: CommandType.Fork })"
    >
      Fork
    </UiButton>
    <UiButton
      v-if="session.state !== SessionState.Closed"
      @click="sendCommand({ sessionId: session.id, type: CommandType.CloseSession })"
    >
      Close
    </UiButton>
  </li>
</template>
