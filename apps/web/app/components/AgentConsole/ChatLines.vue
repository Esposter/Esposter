<script setup lang="ts">
import type { AssistantMessageEvent } from "agent-console-server/contracts";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { CHAT_LINE_DURATION_MS, MAX_CHAT_LINE_COUNT } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { AgentEventType } from "agent-console-server/contracts";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { isConsoleOpen } = storeToRefs(agentConsolePanelStore);
const { openConsole } = agentConsolePanelStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { conversationEvents } = storeToRefs(agentConsoleSessionStore);
const replies = ref<AssistantMessageEvent[]>([]);
// A log replayed on connecting is history, not something the agent is saying now
const shownAfter = new Date();
const chatLineDuration = `${CHAT_LINE_DURATION_MS}ms`;

watch(
  () => conversationEvents.value.length,
  (newLength, oldLength) => {
    if (isConsoleOpen.value) return;
    const newReplies = conversationEvents.value
      .slice(oldLength, newLength)
      .filter(
        (event): event is AssistantMessageEvent =>
          event.type === AgentEventType.AssistantMessage && event.createdAt >= shownAfter,
      );
    if (newReplies.length > 0) replies.value = [...replies.value, ...newReplies].slice(-MAX_CHAT_LINE_COUNT);
  },
);
</script>

<template>
  <!-- Only a reply's opening words, on one line: a diff or a permission request always opens the console instead -->
  <ol role="log" aria-label="Latest replies" list-none flex flex-col gap-1 items-start>
    <li
      v-for="{ id, text } of replies"
      :key="id"
      class="chat-line"
      max-w-full
      @animationend="replies = replies.filter((reply) => reply.id !== id)"
    >
      <button
        px-2
        bg="panel/85"
        max-w-full
        cursor-pointer
        truncate
        type="button"
        @click="openConsole(AgentConsolePanelType.Conversation)"
      >
        {{ text }}
      </button>
    </li>
  </ol>
</template>

<style scoped>
/* Held, then faded out, as a game's chat line is */
.chat-line {
  animation: chat-line-fade v-bind(chatLineDuration) steps(4, end) forwards;
}

@keyframes chat-line-fade {
  0%,
  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
