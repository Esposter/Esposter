<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { DEFAULT_HOSTNAME, DEFAULT_PORT } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { pair } = agentConsoleConnectionStore;
const editedHostUrl = ref("");
// A host answering on the loopback is worth saying so: then the only step left is pasting what it printed. The
// Answer carries no token, so a page cannot pair itself with a host by finding one
const { data: isHostRunning } = useFetch(`http://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}/`, {
  default: () => false,
  server: false,
  transform: () => true,
});
</script>

<template>
  <StyledEmptyState
    description="The console runs your sessions through a host on the machine that holds your code. Start one, then open the link it prints or paste its host URL here."
    icon="mdi-console-network-outline"
    title="Pair with a host"
  >
    <code>pnpm dlx agent-console-server</code>
    <div v-if="isHostRunning" text-primary>A host is running on this machine — paste the URL it printed.</div>
    <v-form flex gap-2 max-w-160 w-full @submit.prevent="pair(editedHostUrl)">
      <v-text-field
        v-model="editedHostUrl"
        label="Host URL"
        :placeholder="`ws://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}/?token=…`"
      />
      <StyledButton :button-props="{ disabled: !editedHostUrl, text: 'Pair' }" type="submit" />
    </v-form>
  </StyledEmptyState>
</template>
