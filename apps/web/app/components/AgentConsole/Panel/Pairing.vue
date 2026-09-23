<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { DEFAULT_HOSTNAME, DEFAULT_PORT } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { pair } = agentConsoleConnectionStore;
const editedHostUrl = ref("");
// A host answering on the loopback is worth saying so: then the only step left is pasting what it printed. The
// Answer carries no token, so a page cannot pair itself with a host by finding one
const { refresh, status } = useFetch(`http://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}/`, { server: false });
</script>

<template>
  <UiFrame title="Pair with a host">
    <p>
      The console runs your sessions through a host on the machine that holds your code. Start one, then open the link
      it prints or paste its host URL here.
    </p>
    <code px-2 py-1 bg-background>pnpm dlx agent-console-server</code>
    <p v-if="status === 'success'" text-success role="status">
      A host is running on this machine — paste the URL it printed.
    </p>
    <div v-else flex flex-wrap gap-2 items-center role="status">
      <template v-if="status === 'error'">
        <span text-muted>No host is answering on this machine yet.</span>
        <UiButton @click="refresh()">Look again</UiButton>
      </template>
      <span v-else text-muted>Looking for a host on this machine…</span>
    </div>
    <form flex gap-2 @submit.prevent="pair(editedHostUrl)">
      <input
        v-model="editedHostUrl"
        aria-label="Host URL"
        flex-1
        min-w-0
        :placeholder="`ws://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}/?token=…`"
        ui-sunk
      />
      <UiButton :disabled="!editedHostUrl" type="submit">Pair</UiButton>
    </form>
  </UiFrame>
</template>
