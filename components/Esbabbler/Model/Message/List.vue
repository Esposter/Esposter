<script setup lang="ts">
import VWaypoint from "@/components/VWaypoint.vue";
import type { MessageEntity } from "@/models/esbabbler/message";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  readMoreMessages: NonNullable<InstanceType<typeof VWaypoint>["$props"]["onChange"]>;
}

const { messages, hasMore, readMoreMessages } = defineProps<MessageListProps>();
</script>

<template>
  <v-list flex flex-1 flex-col-reverse basis-full overflow-y-auto="!" lines="two">
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) in messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <VWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>
