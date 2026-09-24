<script setup lang="ts">
import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSentMessageStore } from "@/store/message/sentMessage";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

const { readMoreSentMessages } = useReadSentMessages();
const sentMessageStore = useSentMessageStore();
const { hasMore, isLoaded, items } = storeToRefs(sentMessageStore);
const getRow = ({ message, room }: SentMessageWithRoom): UiListItem<string> => ({
  description: message.message,
  image: room.image ?? "",
  title: room.name,
  to: RoutePath.MessagesMessage(message.partitionKey, message.rowKey),
  value: `${message.partitionKey}${ID_SEPARATOR}${message.rowKey}`,
});
</script>

<template>
  <div v-if="items.length > 0" flex flex-col>
    <MessageDraftsAndSentTimelineList
      :get-date="({ message }) => message.createdAt"
      :get-row
      :items
      label="Sent messages"
    />
    <StyledWaypoint :is-active="hasMore" @change="readMoreSentMessages" />
  </div>
  <UiEmptyState
    v-else-if="isLoaded"
    description="What you send in any room is listed here, newest first."
    :meaning="UiIconMeaning.Send"
    title="No sent messages"
  />
  <MessageDraftsAndSentListSkeleton v-else />
</template>
