<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getEventSearchText } from "@/services/agentConsole/getEventSearchText";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { SessionState } from "agent-console-server/contracts";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { conversationEvents, sessionState, streamDraft } = storeToRefs(agentConsoleSessionStore);
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
// Follows the conversation while the reader is at its end, a reply as it is written included, and stays put once they
// Scroll up to read
watch([() => displayEvents.value.length, () => streamDraft.value?.text.length], async () => {
  if (!arrivedState.bottom || !scrollContainer.value) return;
  await nextTick();
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
});
</script>

<template>
  <UiFrame>
    <UiTextField v-model="searchQuery" label="Search this session" :type="UiTextFieldType.Search" />
    <div ref="scrollContainer" flex flex-1 flex-col gap-3 min-h-0 of-y-auto>
      <AgentConsolePanelConversationItem v-for="event of displayEvents" :key="event.id" :event />
      <AgentConsolePanelStreamDraft v-if="streamDraft && !searchQuery" :stream-draft />
      <AgentConsolePanelWorking
        v-if="sessionState && [SessionState.Compacting, SessionState.Running].includes(sessionState)"
      />
    </div>
  </UiFrame>
</template>
