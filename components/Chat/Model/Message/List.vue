<script setup lang="ts">
import VWaypoint from "@/components/VWaypoint.vue";
import type { MessageEntity } from "@/models/azure/message";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  readMoreMessages: InstanceType<typeof VWaypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { messages, hasMore, readMoreMessages } = $(toRefs(props));
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" overflow-y="auto!" lines="two">
    <ChatModelMessageListItemContainer
      v-for="(message, index) in messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <VWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>

<style scoped lang="scss">
// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  -webkit-line-clamp: unset;
}
</style>
