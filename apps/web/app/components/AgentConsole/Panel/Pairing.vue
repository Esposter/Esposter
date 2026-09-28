<script setup lang="ts">
import { HOST_INSTALLER_URL } from "@/services/agentConsole/constants";
import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { linkedHost } = storeToRefs(agentConsoleConnectionStore);
const { connectThisComputer, pairLinkedHost } = agentConsoleConnectionStore;
// A link is anyone's to craft, so one pointing at another computer says so before the reader connects to it
const remoteHostname = computed(() => getRemoteHostname(linkedHost.value.address));
</script>

<!-- One way in, in the fewest plain steps: nothing is asked of the loopback before the reader acts, so the page offers
     the download, and Connect opens the host through the browser's own prompt and pairs with it -->
<template>
  <UiFrame title="Connect your computer">
    <template v-if="linkedHost.address">
      <p v-if="remoteHostname">
        This link connects to another computer, {{ remoteHostname }}. Only connect if you started the host there
        yourself.
      </p>
      <p v-else>Connect to the host you just opened?</p>
      <UiButton self-start @click="pairLinkedHost(linkedHost.address, linkedHost.code)">Connect</UiButton>
    </template>
    <template v-else>
      <ol pl-6 list-decimal flex flex-col gap-2>
        <li><UiButtonLink :to="HOST_INSTALLER_URL">Download the host</UiButtonLink></li>
        <li>Open the file you downloaded. If Windows says it protected your PC, click More info, then Run anyway.</li>
        <li flex flex-col gap-2 items-start>
          <span>Connect, and let your browser open the host when it asks.</span>
          <UiButton @click="connectThisComputer()">Connect</UiButton>
        </li>
      </ol>
      <p text-muted>Windows only for now.</p>
    </template>
  </UiFrame>
</template>
