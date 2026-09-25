<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { MenuKeyStepMap } from "@/services/agentConsole/constants";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { RoutePath } from "@esposter/shared";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { unpair } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
const { openConsole } = agentConsolePanelStore;
const menu = useTemplateRef("menu");
const activeElement = useActiveElement();
// The next item or the one before, wrapping at either end: from nothing focused yet, down is the first and up the last
const moveFocus = (event: KeyboardEvent) => {
  const step = MenuKeyStepMap[event.key.toLowerCase()];
  if (!step || !menu.value) return;
  event.preventDefault();
  const items = [...menu.value.querySelectorAll<HTMLElement>("a, button")];
  const index = activeElement.value ? items.indexOf(activeElement.value) : -1;
  items.at(index === -1 && step < 0 ? -1 : (index + step) % items.length)?.focus();
};
</script>

<template>
  <!-- What leaves the world or the host, opened by Escape and by the bar's pause mark alike, so a touch reaches the -->
  <!-- Same list the keys do -->
  <UiDialog
    v-model="isPauseMenuOpen"
    title="Paused"
    w="[min(24rem,90vw)]"
    @keydown="(event: KeyboardEvent) => moveFocus(event)"
  >
    <nav ref="menu" aria-label="Paused" p-3 flex flex-col gap-2>
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
