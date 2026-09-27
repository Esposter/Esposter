<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { PAIRING_HASH_PARAMETER } from "agent-console-server/contracts";

definePageMeta({ layout: "immersive" });
useHead({ title: "Agent console" });

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { linkedHostUrl } = storeToRefs(agentConsoleConnectionStore);
const { connect, disconnect } = agentConsoleConnectionStore;
// The link a host prints carries its address in the fragment, which never reaches a server; it is read once and
// Cleared, so a reload or a shared URL does not carry it again. It fills the pairing form rather than pairing, so the
// Reader sees the host before anything they type reaches it, and a page already paired keeps its host. The entry's
// State is carried over: the router keeps its back and forward positions there, and the navigation trail its crumbs
onMounted(() => {
  const hostUrl = new URLSearchParams(window.location.hash.slice(1)).get(PAIRING_HASH_PARAMETER);
  if (hostUrl) {
    window.history.replaceState(window.history.state, "", window.location.pathname);
    linkedHostUrl.value = hostUrl;
  }
  connect();
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
