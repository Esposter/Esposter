<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { CommandType } from "agent-console-server/contracts";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { closeSideChat, sendCommand } = agentConsoleConnectionStore;
const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
const { sideChatSessionId } = storeToRefs(agentConsoleSideChatStore);
// Everything under the drawer reads the side chat's session through its side chat prop, and nothing in the console's
const { isTurnRunning, pendingPermissionRequests } = useAgentConsoleSession(true);
const sideChat = useTemplateRef("sideChat");
// Opening it puts the keys in its composer, as opening the console puts them in the console's
onMounted(() => sideChat.value?.querySelector("textarea")?.focus());
</script>

<template>
  <!-- Beside the console's tabs, as its own column. Escape closes it here, and only here: the console's Escape is past it -->
  <section
    ref="sideChat"
    aria-label="Side chat"
    flex
    shrink-0
    flex-col
    gap-2
    min-h-0
    w-96
    @keydown.esc.prevent="closeSideChat()"
    @keydown.ctrl.b.prevent="
      () => {
        // The drawer's Ctrl+B is its own session's, and claims the key so the console's does not also act
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
        @click="closeSideChat()"
      />
    </header>
    <p text-muted>Asks about this conversation without adding to it. Closing it discards its answers.</p>
    <AgentConsolePanelConversation is-side-chat flex-1 min-h-32 />
    <AgentConsolePanelPermission
      v-for="permissionRequest of pendingPermissionRequests"
      :key="permissionRequest.requestId"
      is-side-chat
      :permission-request
    />
    <AgentConsolePanelComposer is-side-chat />
  </section>
</template>
