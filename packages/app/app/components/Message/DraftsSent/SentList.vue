<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsSent/getTimelineSections";
import { useSentMessageStore } from "@/store/message/sentMessage";

const { readMoreSentMessages } = useReadSentMessages();
const sentMessageStore = useSentMessageStore();
const { hasMore, isPending, items } = storeToRefs(sentMessageStore);
const sections = computed(() => getTimelineSections(items.value, ({ message }) => message.createdAt));
</script>

<template>
  <div v-if="items.length" flex flex-col gap-y-6>
    <MessageDraftsSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsSentSentListItem
        v-for="{ message, room } of section.items"
        :key="`${message.partitionKey}:${message.rowKey}`"
        :message="message"
        :room="room"
      />
    </MessageDraftsSentSection>
    <StyledWaypoint :is-active="hasMore" @change="readMoreSentMessages" />
  </div>
  <MessageDraftsSentEmptyState v-else-if="!isPending" icon="mdi-send-outline" title="No sent messages" />
</template>
