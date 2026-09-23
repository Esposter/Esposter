<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { RoutePath } from "@esposter/shared";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { unpair } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
const { openConsole } = agentConsolePanelStore;
</script>

<template>
  <!-- What leaves the world or the host, kept off the heads-up display, which only describes the session -->
  <UiDialog v-model="isPauseMenuOpen" title="Paused" w="[min(24rem,90vw)]">
    <nav aria-label="Paused" p-3 flex flex-col gap-2>
      <UiButton @click="isPauseMenuOpen = false">Back to the world</UiButton>
      <UiButton
        @click="
          async () => {
            isPauseMenuOpen = false;
            await openConsole(AgentConsolePanelType.Sessions);
          }
        "
      >
        Sessions
      </UiButton>
      <UiButton v-if="status !== ConnectionStatus.Unpaired" @click="unpair()">Unpair</UiButton>
      <UiButtonLink :to="RoutePath.Index">Leave to the app</UiButtonLink>
    </nav>
  </UiDialog>
</template>
