<script setup lang="ts">
import type { Connection } from "@/models/agentConsole/Connection";

import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { LOCAL_HOST_ADDRESS } from "@/services/agentConsole/constants";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

interface Props {
  connection: Connection;
  status: ConnectionStatus;
}

const { connection, status } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { reconnect, startHost } = agentConsoleConnectionStore;
</script>

<!-- This computer's host is started again from the page; a host elsewhere is started where it runs, and is only
     reconnected to once it was stopped, since one not answering is already retried -->
<template>
  <UiButton
    v-if="
      connection.address === LOCAL_HOST_ADDRESS &&
      (status === ConnectionStatus.Disconnected || status === ConnectionStatus.Stopped)
    "
    @click="startHost(connection.id)"
  >
    Start the host
  </UiButton>
  <UiButton v-else-if="status === ConnectionStatus.Stopped" @click="reconnect(connection.id)">Reconnect</UiButton>
</template>
