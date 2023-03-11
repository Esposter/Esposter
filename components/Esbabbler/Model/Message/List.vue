<script setup lang="ts">
import VWaypoint from "@/components/VWaypoint.vue";
import type { MessageEntity } from "@/models/esbabbler/message";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  readMoreMessages: InstanceType<typeof VWaypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { messages, hasMore, readMoreMessages } = toRefs(props);
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" overflow-y="auto!" lines="two">
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) in messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <VWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>
