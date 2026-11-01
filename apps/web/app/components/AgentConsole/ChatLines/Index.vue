<script setup lang="ts">
import type { AssistantMessageEvent } from "agent-console-server/contracts";

import { MAX_CHAT_LINE_COUNT } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { AgentEventType } from "agent-console-server/contracts";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { isConsoleOpen } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { conversationEvents } = storeToRefs(agentConsoleSessionStore);
const replies = ref<AssistantMessageEvent[]>([]);
// A log replayed on connecting is history, not something the agent is saying now
const shownAfter = new Date();

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
  <!-- Only a reply's opening words, on one line: a diff or a permission request always opens the console instead.
  The list spans the world's width, so only the replies themselves take a pointer from the camera under it -->
  <ol role="log" aria-label="Latest replies" list-none flex flex-col gap-1 items-start>
    <AgentConsoleChatLinesLine
      v-for="{ id, text } of replies"
      :key="id"
      :text
      @fade="replies = replies.filter((reply) => reply.id !== id)"
    />
  </ol>
</template>
