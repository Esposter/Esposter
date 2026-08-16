<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { useSentMessageStore } from "@/store/message/sentMessage";
import { ID_SEPARATOR } from "@esposter/shared";

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
        :key="`${message.partitionKey}${ID_SEPARATOR}${message.rowKey}`"
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
