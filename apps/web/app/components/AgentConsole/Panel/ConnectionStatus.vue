<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
</script>

<template>
  <span :class="status === ConnectionStatus.Connected ? 'text-success' : 'text-warning'" role="status">{{
    status
  }}</span>
</template>
