<script setup lang="ts">
import { getConversationEvents } from "@/services/agentConsole/getConversationEvents";
import { getEventSearchText } from "@/services/agentConsole/getEventSearchText";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { events } = storeToRefs(agentConsoleSessionStore);
const searchQuery = ref("");
const displayEvents = computed(() => {
  const conversationEvents = getConversationEvents(events.value);
  const normalizedSearchQuery = searchQuery.value.toLowerCase();
  return normalizedSearchQuery
    ? conversationEvents.filter((event) => getEventSearchText(event).toLowerCase().includes(normalizedSearchQuery))
    : conversationEvents;
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
  <div flex flex-col>
    <v-text-field
      v-model="searchQuery"
      density="compact"
      placeholder="Search this session"
      prepend-inner-icon="mdi-magnify"
      px-4
      pt-2
    />
    <div ref="scrollContainer" px-4 pb-4 flex flex-1 flex-col gap-3 of-y-auto>
      <AgentConsoleWorkConversationItem v-for="event of displayEvents" :key="event.id" :event />
    </div>
  </div>
</template>
