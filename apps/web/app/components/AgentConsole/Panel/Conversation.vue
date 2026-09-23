<script setup lang="ts">
import { getEventSearchText } from "@/services/agentConsole/getEventSearchText";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { SessionState } from "agent-console-server/contracts";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { conversationEvents, sessionState } = storeToRefs(agentConsoleSessionStore);
const searchQuery = ref("");
const displayEvents = computed(() => {
  const normalizedSearchQuery = searchQuery.value.toLowerCase();
  return normalizedSearchQuery
    ? conversationEvents.value.filter((event) =>
        getEventSearchText(event).toLowerCase().includes(normalizedSearchQuery),
      )
    : conversationEvents.value;
});
const scrollContainer = useTemplateRef("scrollContainer");
const { arrivedState } = useScroll(scrollContainer);
// Follows the conversation while the reader is at its end, and stays put once they scroll up to read
watch(
  () => displayEvents.value.length,
  async () => {
    if (!arrivedState.bottom || !scrollContainer.value) return;
    await nextTick();
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  },
);
</script>

<template>
  <AgentConsolePanelFrame>
    <input v-model="searchQuery" aria-label="Search this session" placeholder="Search this session…" type="search" />
    <div ref="scrollContainer" flex flex-1 flex-col gap-3 min-h-0 of-y-auto>
      <AgentConsolePanelConversationItem v-for="event of displayEvents" :key="event.id" :event />
      <AgentConsolePanelWorking
        v-if="sessionState && [SessionState.Compacting, SessionState.Running].includes(sessionState)"
      />
    </div>
  </AgentConsolePanelFrame>
</template>
