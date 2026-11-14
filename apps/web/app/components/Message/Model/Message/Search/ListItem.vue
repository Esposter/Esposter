<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { checkIsNestedInteraction } from "@esposter/shared";

interface Props {
  message: ClientMessage;
}

const { message } = defineProps<Props>();
const creator = useCreator(() => message);
const scrollToMessage = useScrollToMessage();
</script>

<!-- A found message is a card picked as a whole, as Discord's results are: pressing it jumps to the message in its room -->
<template>
  <div
    :aria-label="`Jump to ${creator.name}'s message`"
    role="button"
    tabindex="0"
    ui-card
    @click="
      (event: MouseEvent) => {
        if (!checkIsNestedInteraction(event)) scrollToMessage(message.roomId, message.id);
      }
    "
    @keydown.enter.self.prevent="scrollToMessage(message.roomId, message.id)"
    @keydown.space.self.prevent="scrollToMessage(message.roomId, message.id)"
  >
    <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
  </div>
</template>
