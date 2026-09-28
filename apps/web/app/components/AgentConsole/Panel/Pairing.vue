<script setup lang="ts">
import { HOST_INSTALLER_URL } from "@/services/agentConsole/constants";
import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { linkedHostUrl } = storeToRefs(agentConsoleConnectionStore);
const { pair } = agentConsoleConnectionStore;
// A link is anyone's to craft, so one pointing at another computer says so before the reader connects to it
const remoteHostname = computed(() => getRemoteHostname(linkedHostUrl.value));
</script>

<!-- One way in, in the fewest plain steps: nothing is asked of the loopback before the reader acts, so the page offers
     the download, and the link the host's window shows brings the reader back here to connect -->
<template>
  <UiFrame title="Connect your computer">
    <template v-if="linkedHostUrl">
      <p v-if="remoteHostname">
        This link connects to another computer, {{ remoteHostname }}. Only connect if you started the host there
        yourself.
      </p>
      <p v-else>Connect to the host you just opened?</p>
      <UiButton self-start @click="pair(linkedHostUrl)">Connect</UiButton>
    </template>
    <template v-else>
      <ol pl-6 list-decimal flex flex-col gap-2>
        <li><UiButtonLink :to="HOST_INSTALLER_URL">Download the host</UiButtonLink></li>
        <li>Open the file you downloaded. If Windows says it protected your PC, click More info, then Run anyway.</li>
        <li>A window opens. Hold Ctrl and click the link in it.</li>
      </ol>
      <p text-muted>Windows only for now.</p>
    </template>
  </UiFrame>
</template>
