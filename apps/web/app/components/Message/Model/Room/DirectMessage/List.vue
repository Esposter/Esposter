<script setup lang="ts">
import { useDirectMessageStore } from "#src/store/message/room/directMessage";

const directMessageStore = useDirectMessageStore();
const { directMessages, hasMore } = storeToRefs(directMessageStore);
const { readDirectMessages, readMoreDirectMessages } = useReadDirectMessages();
const { isPending } = await readDirectMessages();
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-pending @load-more="(onComplete) => readMoreDirectMessages(onComplete)">
    <MessageModelRoomDirectMessageListItem
      v-for="directMessage of directMessages"
      :key="directMessage.id"
      :room="directMessage"
    />
  </MessageModelRoomBaseList>
</template>
