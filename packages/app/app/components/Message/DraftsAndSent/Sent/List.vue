<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";
import { useSentMessageStore } from "@/store/message/sentMessage";

const { readMoreSentMessages } = useReadSentMessages();
const sentMessageStore = useSentMessageStore();
const { hasMore, isPending, items } = storeToRefs(sentMessageStore);
const sections = computed(() => getTimelineSections(items.value, ({ message }) => message.createdAt));
</script>

<template>
  <div v-if="items.length" flex flex-col gap-y-6>
    <MessageDraftsAndSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsAndSentSentListItem
        v-for="{ message, room } of section.items"
        :key="`${message.partitionKey}${COMPOSITE_KEY_SEPARATOR}${message.rowKey}`"
        :message
        :room
      />
    </MessageDraftsAndSentSection>
    <div flex w-full justify-center>
      <StyledWaypoint :is-active="hasMore" @change="readMoreSentMessages" />
    </div>
  </div>
  <StyledEmptyState v-else-if="!isPending" h-full icon="mdi-send-outline" title="No sent messages" />
</template>
