<script setup lang="ts">
import StyledWaypoint from "@/components/Styled/Waypoint.vue";
import type { MessageEntity } from "@/models/esbabbler/message";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  readMoreMessages: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
}

const { messages, hasMore, readMoreMessages } = defineProps<MessageListProps>();
</script>

<template>
  <v-list flex-1 basis-full flex flex-col-reverse overflow-y-auto="!" lines="two">
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) in messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <StyledWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>
