<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
</script>

<template>
  <span :class="status === ConnectionStatus.Connected ? 'connected' : 'warning'" role="status">{{ status }}</span>
</template>

<style scoped>
.connected {
  color: var(--agent-console-success);
}

.warning {
  color: var(--agent-console-warning);
}
</style>
