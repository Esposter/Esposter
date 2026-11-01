<script setup lang="ts">
import type { Connection } from "@/models/agentConsole/Connection";
import type { ConnectionSessionSummary } from "@/models/agentConsole/ConnectionSessionSummary";
import type { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";

import { getConnectionName } from "@/services/agentConsole/getConnectionName";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

interface Props {
  connection: Connection;
  sessions: ConnectionSessionSummary[];
  status: ConnectionStatus;
}

const { connection, sessions, status } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { unpair } = agentConsoleConnectionStore;
</script>

<template>
  <section flex flex-col gap-1>
    <header flex gap-2 items-center>
      <h3 fw-bold flex-1 truncate>{{ getConnectionName(connection.address) }}</h3>
      <AgentConsolePanelConnectionStatus :status />
      <AgentConsolePanelConnectionRestartButton :connection :status />
      <UiButton @click="unpair(connection.id)">Remove</UiButton>
    </header>
    <ul list-none flex flex-col gap-1>
      <AgentConsolePanelSessionsSession v-for="session of sessions" :key="session.id" :session />
    </ul>
  </section>
</template>
