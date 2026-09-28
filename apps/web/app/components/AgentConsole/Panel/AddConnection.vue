<script setup lang="ts">
import { LOCAL_HOST_ADDRESS } from "@/services/agentConsole/constants";
import { toHostAddress } from "@/services/agentConsole/toHostAddress";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { connections } = storeToRefs(agentConsoleConnectionStore);
const { connectThisComputer, pairLinkedHost } = agentConsoleConnectionStore;
const typedAddress = ref("");
const code = ref("");
</script>

<!-- A machine of the reader's own is added here, never on the first screen, which stays one path: the host there prints
     a one-time code, and the page reaches it at an address with a certificate of its own -->
<template>
  <div flex flex-col gap-2>
    <UiButton
      v-if="!connections.some(({ address }) => address === LOCAL_HOST_ADDRESS)"
      self-start
      @click="connectThisComputer()"
    >
      Connect this computer
    </UiButton>
    <UiForm
      @submit="
        () => {
          pairLinkedHost(toHostAddress(typedAddress), code);
          typedAddress = '';
          code = '';
        }
      "
    >
      <p text-muted>
        Add a machine of your own: start the host there, then enter its https address and the code it shows.
      </p>
      <div flex flex-wrap gap-2 items-end>
        <UiTextField v-model="typedAddress" label="Address" flex-1 min-w-0 />
        <UiTextField v-model="code" label="Code" flex-1 min-w-0 />
        <UiButton :disabled="!typedAddress || !code" type="submit">Add</UiButton>
      </div>
    </UiForm>
  </div>
</template>
