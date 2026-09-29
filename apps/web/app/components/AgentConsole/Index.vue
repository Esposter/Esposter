<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { ThemeMode } from "@/models/ui/ThemeMode";
import { UiStyle } from "@/models/ui/UiStyle";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { SplashSequence } from "genshin-world";

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
// The game's opening plays first, its logos and health notice on white, while the page loads behind it; the loading
// Screen then outlives loading by its own fade and hold, as the game's does, and the world cuts in
const isSplashShown = ref(true);
const isLoadingScreenShown = ref(true);
</script>

<template>
  <!-- The world is the page, and the console an overlay called up over it, in the Genshin style whichever style and
    Theme the app is in: dark, as the game's HUD and dialogue are over its world -->
  <UiThemeScope
    :theme="ThemeMode.Dark"
    :ui-style="UiStyle.Genshin"
    class="agent-console"
    text-text
    bg-background
    size-full
    relative
    of-hidden
  >
    <!-- What the bar, the console and the pause menu show comes from local storage and the socket, so none is -->
    <!-- Server-rendered, and none can be reached until the loading screen is gone. The world takes the height the -->
    <!-- Bar under it leaves, so the bar never covers the replies; the console opens over the world -->
    <!-- Rather than resizing it -->
    <section :inert="!isLoaded" flex flex-col size-full>
      <ClientOnly>
        <div flex-1 min-h-0 relative>
          <LazyGenshin />
          <AgentConsoleChatLines :key="currentSessionId" p-2 pointer-events-none inset-x-0 bottom-0 absolute />
          <AgentConsoleSheet v-if="isLoaded" />
        </div>
        <AgentConsolePanelHud />
      </ClientOnly>
    </section>
    <ClientOnly>
      <AgentConsolePauseMenu v-if="isLoaded" />
    </ClientOnly>
    <div v-if="isSplashShown" inset-0 absolute z-1>
      <SplashSequence @finish="isSplashShown = false" />
    </div>
    <AgentConsolePanelLoading v-else-if="isLoadingScreenShown" :loading-steps @finish="isLoadingScreenShown = false" />
  </UiThemeScope>
</template>

<style scoped>
/* One size for everything the page renders, the agent's markdown included: the browser's own sizes for headings are */
/* Dropped, so a reply reads as a line of chat, and what stands out does so by colour and weight. Prose is in the */
/* Style's body face and code, keys and output in its mono */
.agent-console {
  font-family: var(--ui-font-body);
  font-size: var(--ui-text-body);
  line-height: 1.45;
}

.agent-console :deep(:is(b, button, h1, h2, h3, h4, h5, h6, strong)) {
  color: inherit;
  font: inherit;
}

.agent-console :deep(:is(b, h1, h2, h3, h4, h5, h6, strong)) {
  color: var(--ui-heading-color);
  font-weight: var(--ui-weight-heading);
}

.agent-console :deep(:is(code, kbd, pre, samp)) {
  font-family: var(--ui-font-mono);
  font-size: inherit;
}

.agent-console :deep(:is(code, kbd, samp)) {
  color: var(--ui-info);
}
</style>
