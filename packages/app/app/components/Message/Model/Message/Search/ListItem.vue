<script setup lang="ts">
import type { MessageEntity } from "@esposter/db";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useRoomStore } from "@/store/message/room";

interface ListItemProps {
  message: MessageEntity;
}

const { message } = defineProps<ListItemProps>();
const roomStore = useRoomStore();
const { memberMap } = storeToRefs(roomStore);
const creator = computed(() => memberMap.value.get(message.userId));
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
