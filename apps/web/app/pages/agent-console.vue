<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { PAIRING_CODE_PARAMETER, PAIRING_HASH_PARAMETER } from "agent-console-server/contracts";

definePageMeta({ layout: "immersive" });
useHead({ title: "Agent console" });

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { linkedHost } = storeToRefs(agentConsoleConnectionStore);
const { connect, disconnect } = agentConsoleConnectionStore;
// The link a host prints carries its address and a one-time code in the fragment, which never reaches a server; they
// Are read once and cleared, so a reload or a shared URL does not carry them again. They are offered rather than
// Paired with, so the reader sees the host before anything they type reaches it, and a page already paired keeps its
// Host. The entry's
// State is carried over: the router keeps its back and forward positions there, and the navigation trail its crumbs
onMounted(() => {
  const hashParameters = new URLSearchParams(window.location.hash.slice(1));
  const address = hashParameters.get(PAIRING_HASH_PARAMETER);
  if (address) {
    window.history.replaceState(window.history.state, "", window.location.pathname);
    linkedHost.value = { address, code: hashParameters.get(PAIRING_CODE_PARAMETER) ?? "" };
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
