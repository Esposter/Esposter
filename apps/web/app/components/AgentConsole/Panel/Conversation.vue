<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getEventSearchText } from "@/services/agentConsole/getEventSearchText";
import { SessionState } from "agent-console-server/contracts";

interface Props {
  isSideChat?: true;
}

const { isSideChat } = defineProps<Props>();
const { conversationEvents, sessionState, streamDraft } = useAgentConsoleSession(isSideChat);
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
const { arrivedState, measure } = useScroll(scrollContainer);
// Follows the conversation while the reader is at its end, a reply as it is written included, and stays put once they
// Scroll up to read
watch([() => displayEvents.value.length, () => streamDraft.value?.text.length], async () => {
  if (!arrivedState.bottom || !scrollContainer.value) return;
  await nextTick();
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
});
// A conversation opens at its newest message. useScroll reads the position at mount, before this scroll, so it is read
// Again after it, which leaves the reader at the end the watch above follows from
onMounted(() => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  measure();
});
</script>

<template>
  <UiFrame>
    <UiTextField v-model="searchQuery" label="Search this session" :type="UiTextFieldType.Search" />
    <div ref="scrollContainer" flex flex-1 flex-col gap-3 min-h-0 of-y-auto>
      <AgentConsolePanelConversationItem v-for="event of displayEvents" :key="event.id" :event :is-side-chat />
      <AgentConsolePanelStreamDraft v-if="streamDraft && !searchQuery" :stream-draft :is-side-chat />
      <AgentConsolePanelWorking
        v-if="sessionState && [SessionState.Compacting, SessionState.Running].includes(sessionState)"
        :is-side-chat
      />
    </div>
  </UiFrame>
</template>
