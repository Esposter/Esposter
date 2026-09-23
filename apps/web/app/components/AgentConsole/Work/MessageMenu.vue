<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { CommandType } from "agent-console-server/contracts";

interface Props {
  messageUuid: string;
  sessionId: string;
}

const { messageUuid, sessionId } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
</script>

<template>
  <StyledTooltipMenuIconButton :button-props="{ size: 'small' }" icon="mdi-source-branch" text="Fork or rewind here">
    <v-list density="compact">
      <v-list-item
        prepend-icon="mdi-source-fork"
        title="Fork from here"
        @click="sendCommand({ messageUuid, sessionId, type: CommandType.Fork })"
      />
      <v-list-item
        prepend-icon="mdi-history"
        title="Rewind to here"
        @click="sendCommand({ messageUuid, sessionId, type: CommandType.ResumeAt })"
      />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
