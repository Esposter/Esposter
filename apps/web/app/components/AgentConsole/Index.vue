<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { ThemeMode } from "@/models/ui/ThemeMode";
import { UiStyle } from "@/models/ui/UiStyle";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isWorldLoaded, isWorldReady } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
const isMounted = useMounted();
const loadingSteps = computed<LoadingStep[]>(() => [
  { isDone: isMounted.value, title: "Starting the page" },
  { isDone: isWorldLoaded.value, title: "Loading the world" },
  { isDone: isWorldReady.value, title: "Drawing the world" },
  { isDone: isMounted.value && status.value !== ConnectionStatus.Connecting, title: "Reaching the host" },
]);
// Once loaded, the page stays loaded: pairing again later shows its own connecting line, not the loading screen
const isLoaded = ref(false);
whenever(
  () => loadingSteps.value.every(({ isDone }) => isDone),
  () => {
    isLoaded.value = true;
  },
  { once: true },
);
</script>

<template>
  <!-- The world is the page, and the console an overlay called up over it. The page stays in dusk whichever theme the
    App is in -->
  <UiThemeScope
    :theme="ThemeMode.Dark"
    :ui-style="UiStyle.Voxel"
    class="agent-console"
    text-text
    bg-background
    size-full
    relative
    of-hidden
  >
    <!-- What the bar and the overlays show comes from local storage and the socket, so none is server-rendered, and -->
    <!-- None can be reached until the loading screen is gone. The world takes the height the bar under it leaves, so -->
    <!-- The bar never covers the joystick or the replies -->
    <section :inert="!isLoaded" flex flex-col size-full>
      <ClientOnly>
        <div flex-1 min-h-0 relative>
          <LazyAgentConsoleWorld />
          <AgentConsoleChatLines :key="currentSessionId"      p-2 pointer-events-none inset-x-0 bottom-0 absolute  />
        </div>
        <AgentConsolePanelHud />
      </ClientOnly>
    </section>
    <ClientOnly>
      <template v-if="isLoaded">
        <AgentConsoleOverlay />
        <AgentConsolePauseMenu />
      </template>
    </ClientOnly>
    <AgentConsolePanelLoading v-if="!isLoaded" :loading-steps />
  </UiThemeScope>
</template>

<style scoped>
/* One face at one size for everything the page renders, the agent's markdown included: the browser's own sizes for */
/* Code and headings are dropped, and what stands out does so by colour alone. The page is pinned to voxel, and reads */
/* Its mono face as a terminal does, the one readable text leaves alone */
.agent-console {
  font-family: var(--ui-font-mono);
  font-size: var(--ui-text-body);
  line-height: 1.2;
}

.agent-console :deep(:is(b, button, code, h1, h2, h3, h4, h5, h6, kbd, pre, samp, strong)) {
  color: inherit;
  font: inherit;
}

.agent-console :deep(:is(b, h1, h2, h3, h4, h5, h6, strong)) {
  color: var(--ui-heading-color);
}

.agent-console :deep(:is(code, kbd, samp)) {
  color: var(--ui-info);
}
</style>
