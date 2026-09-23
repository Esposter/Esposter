<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { UiTheme } from "@/models/ui/UiTheme";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isWorldExpanded, isWorldReady } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, pendingPermissionRequests } = storeToRefs(agentConsoleSessionStore);
// Pairing takes the page to itself; after it, a request waiting on a verdict brings the panels back, so an expanded
// World never hides a question the agent asked
const isPanelColumnShown = computed(
  () =>
    status.value !== ConnectionStatus.Unpaired &&
    (!isWorldExpanded.value || pendingPermissionRequests.value.length > 0),
);
const isMounted = useMounted();
const loadingSteps = computed<LoadingStep[]>(() => [
  { isDone: isMounted.value, title: "Starting the page" },
  { isDone: isWorldReady.value, title: "Building the world" },
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
// The panels' column beside the world; on a narrow screen the world is a strip above them. The page stays in dusk
// Whichever theme the app is in
</script>

<template>
  <UiThemeScope
    :theme="UiTheme.Dusk"
    class="agent-console"
    :class="isPanelColumnShown ? 'rows-[1fr_2fr] md:cols-2 md:rows-1' : 'rows-1'"
    text-text
    bg-background
    grid
    size-full
    relative
    of-hidden
  >
    <!-- What a panel shows comes from local storage and the socket, so none is server-rendered, and none can be -->
    <!-- Reached until the loading screen is gone -->
    <section v-show="isPanelColumnShown" :inert="!isLoaded" p-2 flex flex-col gap-2 min-h-0 md:order-first>
      <ClientOnly>
        <template v-if="status !== ConnectionStatus.Unpaired">
          <UiFrame v-if="status !== ConnectionStatus.Connected">
            <p v-if="status === ConnectionStatus.Connecting" role="status">Connecting to the host…</p>
            <p v-else text-warning role="status">
              The host is not answering. Reconnecting — start it again and the page picks up where it was.
            </p>
          </UiFrame>
          <UiFrame v-if="!currentSessionId" title="Sessions" flex-1>
            <AgentConsolePanelSessions />
          </UiFrame>
          <template v-else>
            <AgentConsolePanelConversation flex-1 />
            <!-- A request waiting on a verdict stays open until it has one, as the terminal's prompt does -->
            <AgentConsolePanelPermission
              v-for="permissionRequest of pendingPermissionRequests"
              :key="permissionRequest.requestId"
              :permission-request
            />
            <AgentConsolePanelComposer />
          </template>
        </template>
      </ClientOnly>
    </section>
    <section :inert="!isLoaded" min-h-0 order-first relative>
      <ClientOnly>
        <LazyAgentConsoleWorld />
        <div p-2 flex flex-col gap-2 pointer-events-none inset-0 absolute>
          <template v-if="status !== ConnectionStatus.Unpaired">
            <AgentConsolePanelHud pointer-events-auto />
            <AgentConsolePanelOpened min-h-0 pointer-events-auto />
          </template>
        </div>
      </ClientOnly>
    </section>
    <ClientOnly>
      <AgentConsolePanelPairing v-if="status === ConnectionStatus.Unpaired" :inert="!isLoaded" />
    </ClientOnly>
    <AgentConsolePanelLoading v-if="!isLoaded" :loading-steps />
  </UiThemeScope>
</template>

<style scoped>
/* One pixel face at one size for everything the page renders, the agent's markdown included: the browser's own */
/* Sizes for code and headings are dropped, and what stands out does so by colour alone */
.agent-console {
  font-family: VT323, monospace;
  font-size: 1.25rem;
  line-height: 1.2;
}

.agent-console :deep(:is(b, button, code, h1, h2, h3, h4, h5, h6, kbd, pre, samp, strong)) {
  color: inherit;
  font: inherit;
}

.agent-console :deep(:is(b, h1, h2, h3, h4, h5, h6, strong)) {
  color: var(--ui-accent);
}

.agent-console :deep(:is(code, kbd, samp)) {
  color: var(--ui-info);
}
</style>
