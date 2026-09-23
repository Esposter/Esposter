<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

interface Props {
  messageUuid: string;
}

const { messageUuid } = defineProps<Props>();
defineSlots<{ default?: () => VNode }>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <div flex gap-1 items-start>
    <AgentConsolePanelButton @click="sendCommand({ messageUuid, sessionId: currentSessionId, type: CommandType.Fork })">
      Fork
    </AgentConsolePanelButton>
    <AgentConsolePanelButton
      @click="sendCommand({ messageUuid, sessionId: currentSessionId, type: CommandType.ResumeAt })"
    >
      Rewind
    </AgentConsolePanelButton>
    <slot />
  </div>
</template>
