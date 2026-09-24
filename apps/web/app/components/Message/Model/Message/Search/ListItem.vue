<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";

interface Props {
  message: MessageEntity;
}

const { message } = defineProps<Props>();
const creator = useCreator(() => message);
const scrollToMessage = useScrollToMessage();
</script>

<!-- A found message is a card picked as a whole, as Discord's results are: pressing it jumps to the message in its room -->
<template>
  <div
    v-if="creator"
    :aria-label="`Jump to ${creator.name}'s message`"
    role="button"
    tabindex="0"
    ui-card
    @click="scrollToMessage(message.partitionKey, message.rowKey)"
    @keydown.enter.self.prevent="scrollToMessage(message.partitionKey, message.rowKey)"
    @keydown.space.self.prevent="scrollToMessage(message.partitionKey, message.rowKey)"
  >
    <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
  </div>
</template>
