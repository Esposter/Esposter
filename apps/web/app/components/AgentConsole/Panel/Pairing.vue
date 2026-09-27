<script setup lang="ts">
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { DEFAULT_HOSTNAME, DEFAULT_PORT } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { linkedHostUrl } = storeToRefs(agentConsoleConnectionStore);
const { pair } = agentConsoleConnectionStore;
// Nothing is asked of the loopback before pairing: a page that looked for a host would be a site reaching into the
// Reader's machine unasked, so the reader starts one and pastes what it printed — or opens its link, which fills
// The field for them to check and pair
const { cloned: editedHostUrl } = useCloned(linkedHostUrl);
</script>

<template>
  <UiFrame title="Pair with a host">
    <p>
      The console runs your sessions through a host on the machine that holds your code. Start one, then open the link
      it prints or paste its host URL here, and pair once the address is the host you started.
    </p>
    <code px-2 py-1 bg-background>pnpm dlx agent-console-server</code>
    <UiForm @submit="pair(editedHostUrl)">
      <div flex gap-2 items-end>
        <UiTextField v-model="editedHostUrl" label="Host URL" flex-1 min-w-0 />
        <UiButton :disabled="!editedHostUrl" type="submit">Pair</UiButton>
      </div>
      <span text-muted>It looks like ws://{{ DEFAULT_HOSTNAME }}:{{ DEFAULT_PORT }}/?token=…</span>
    </UiForm>
  </UiFrame>
</template>
