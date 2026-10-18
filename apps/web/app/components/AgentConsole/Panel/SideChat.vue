<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AGENT_CONSOLE_SESSION_KEY } from "@/services/agentConsole/constants";
import { createSessionReads } from "@/services/agentConsole/createSessionReads";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { closeSideChat, sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { sessions } = storeToRefs(agentConsoleSessionStore);
const { getDataRef } = agentConsoleSessionStore;
const { sideChatSessionId } = storeToRefs(useAgentConsoleSideChatStore());
// The drawer's own composer draft, which is not the console's and is never kept past the drawer
const composerText = ref("");
// Everything under the drawer reads the side chat's session through this scope, and nothing in the console's
const sideChatSession = {
  ...createSessionReads(sideChatSessionId, getDataRef, sessions),
  composerText,
  sessionId: sideChatSessionId,
};
provide(AGENT_CONSOLE_SESSION_KEY, sideChatSession);
const { isTurnRunning, pendingPermissionRequests } = sideChatSession;
const sideChat = useTemplateRef("sideChat");
// Opening it puts the keys in its composer, as opening the console puts them in the console's
onMounted(() => sideChat.value?.querySelector("textarea")?.focus());
</script>

<template>
  <!-- Beside the console's tabs, as its own column. Escape closes it here, and only here: the console's Escape is past it -->
  <section
    ref="sideChat"
    aria-label="Side chat"
    w-96
    min-h-0
    flex
    flex-col
    gap-2
    shrink-0
    @keydown.esc="
      (event: KeyboardEvent) => {
        event.preventDefault();
        closeSideChat();
      }
    "
    @keydown.ctrl.b="
      (event: KeyboardEvent) => {
        // The drawer's Ctrl+B is its own session's, and claims the key so the console's does not also act
        event.preventDefault();
        if (isTurnRunning) sendCommand({ sessionId: sideChatSessionId, type: CommandType.BackgroundTasks });
      }
    "
  >
    <header flex gap-2 items-center>
      <h3 text-heading-color flex-1 truncate>Side chat</h3>
      <UiIconButton
        label="Close the side chat"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="closeSideChat"
      />
    </header>
    <p text-muted>Asks about this conversation without adding to it. Closing it discards its answers.</p>
    <AgentConsolePanelConversation is-side-chat flex-1 min-h-32 />
    <AgentConsolePanelPermission
      v-for="permissionRequest of pendingPermissionRequests"
      :key="permissionRequest.requestId"
      :permission-request
    />
    <AgentConsolePanelComposer is-side-chat />
  </section>
</template>
