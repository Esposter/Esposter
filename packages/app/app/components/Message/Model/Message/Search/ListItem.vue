<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useRoomStore } from "@/store/message/room";

interface ListItemProps {
  message: MessageEntity;
}

const { message } = defineProps<ListItemProps>();
const roomStore = useRoomStore();
const { memberMap } = storeToRefs(roomStore);
const creator = computed(() => (message.userId ? memberMap.value.get(message.userId) : undefined));
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <component
    :is="MessageComponentMap[message.type]"
    v-if="creator"
    :creator
    :message
    is-preview
    @click="scrollToMessage(message.rowKey)"
  />
</template>
