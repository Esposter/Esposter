<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useRoomStore } from "@/store/message/room";

interface MessageProps {
  message: MessageEntity;
}

const { message } = defineProps<MessageProps>();
const scrollToMessage = useScrollToMessage();
const roomStore = useRoomStore();
const { memberMap } = storeToRefs(roomStore);
const creator = computed(() => memberMap.value.get(message.userId));
</script>

<template>
  <v-list-item v-if="creator" @click="scrollToMessage(message.rowKey)">
    <MessageModelMessageType :creator :message is-preview />
  </v-list-item>
</template>
