<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { MenuKeyStepMap } from "@/services/agentConsole/MenuKeyStepMap";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { RoutePath } from "@esposter/shared";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const { unpair } = agentConsoleConnectionStore;
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isOptionsOpen, isPauseMenuOpen, isPromptShown } = storeToRefs(agentConsolePanelStore);
// Escape and the close button step back out of Options to the menu, as a game's do, and close only the menu itself
const isOpen = computed({
  get: () => isPauseMenuOpen.value,
  set: (newIsOpen) => {
    if (!newIsOpen && isOptionsOpen.value) isOptionsOpen.value = false;
    else isPauseMenuOpen.value = newIsOpen;
  },
});
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
    v-model="isOpen"
    :title="isOptionsOpen ? 'Options' : 'Paused'"
    w="[min(24rem,90vw)]"
    @keydown="(event: KeyboardEvent) => moveFocus(event)"
  >
    <!-- A setting is added here only when something needs it, and takes effect the moment it changes -->
    <div v-if="isOptionsOpen" ref="menu" p-3 flex flex-col gap-2>
      <UiSwitch v-model="isPromptShown" is-label-shown label="Show prompts over what can be used" />
      <UiButton @click="isOptionsOpen = false">Done</UiButton>
    </div>
    <nav v-else ref="menu" aria-label="Paused" p-3 flex flex-col gap-2>
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
      <UiButton @click="isOptionsOpen = true">Options</UiButton>
      <UiButton v-if="status !== ConnectionStatus.Unpaired" @click="unpair()">Unpair</UiButton>
      <UiButtonLink :to="RoutePath.Index">Leave to the app</UiButtonLink>
    </nav>
  </UiDialog>
</template>
