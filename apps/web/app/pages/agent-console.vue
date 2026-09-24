<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { PAIRING_HASH_PARAMETER } from "agent-console-server/contracts";

definePageMeta({ layout: "immersive" });
useHead({ title: "Agent console" });

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connect, disconnect, pair } = agentConsoleConnectionStore;
// The link a host prints carries its address in the fragment, which never reaches a server; it is read once and
// Cleared, so a reload or a shared URL does not re-pair
onMounted(() => {
  const hostUrl = new URLSearchParams(window.location.hash.slice(1)).get(PAIRING_HASH_PARAMETER);
  if (hostUrl) {
    window.history.replaceState(null, "", window.location.pathname);
    pair(hostUrl);
  } else connect();
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <NuxtLayout>
    <AgentConsole />
  </NuxtLayout>
</template>
