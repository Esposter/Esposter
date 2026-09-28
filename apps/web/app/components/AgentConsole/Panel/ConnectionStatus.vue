<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";

interface Props {
  status: ConnectionStatus;
}

const { status } = defineProps<Props>();
</script>

<template>
  <span :class="status === ConnectionStatus.Connected ? 'text-success' : 'text-warning'" role="status">{{
    status
  }}</span>
</template>
