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
  <!-- The one thing to do until it is done, so it takes the middle of the page over the room, as a title screen does -->
  <div class="pairing" p-4 flex flex-col gap-6 items-center inset-0 justify-center absolute>
    <h1 class="title">Agent console</h1>
    <AgentConsolePanelFrame title="Pair with a host" max-w-3xl w-full>
      <p>
        The console runs your sessions through a host on the machine that holds your code. Start one, then open the link
        it prints or paste its host URL here.
      </p>
      <code class="command" px-2 py-1>pnpm dlx agent-console-server</code>
      <p v-if="status === 'success'" class="running" role="status">
        A host is running on this machine — paste the URL it printed.
      </p>
      <div v-else flex flex-wrap gap-2 items-center role="status">
        <template v-if="status === 'error'">
          <span class="muted">No host is answering on this machine yet.</span>
          <AgentConsolePanelButton @click="refresh()">Look again</AgentConsolePanelButton>
        </template>
        <span v-else class="muted">Looking for a host on this machine…</span>
      </div>
      <form flex gap-2 @submit.prevent="pair(editedHostUrl)">
        <input
          v-model="editedHostUrl"
          aria-label="Host URL"
          flex-1
          min-w-0
          :placeholder="`ws://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}/?token=…`"
        />
        <AgentConsolePanelButton :disabled="!editedHostUrl" type="submit">Pair</AgentConsolePanelButton>
      </form>
    </AgentConsolePanelFrame>
  </div>
</template>

<style scoped>
/* The room stays in view behind, dimmed so the text over it reads */
.pairing {
  background-color: color-mix(in srgb, var(--agent-console-background) 70%, transparent);
  font-size: 1.5rem;
}

.title {
  color: var(--agent-console-accent);
  font-size: 3rem;
}

.command {
  background-color: var(--agent-console-background);
}

.muted {
  color: var(--agent-console-muted);
}

.running {
  color: var(--agent-console-success);
}
</style>
