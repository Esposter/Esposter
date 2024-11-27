<script setup lang="ts">
import type { MessageEntity } from "#shared/models/esbabbler/message";

import StyledWaypoint from "@/components/Styled/Waypoint.vue";

interface MessageListProps {
  hasMore: boolean;
  messages: MessageEntity[];
  readMoreMessages: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
}

const { hasMore, messages, readMoreMessages } = defineProps<MessageListProps>();
</script>

<template>
  <v-list flex-1 flex basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) of messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <StyledWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>
