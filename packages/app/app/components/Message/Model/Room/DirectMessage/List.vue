<script setup lang="ts">
import { useDirectMessageStore } from "@/store/message/room/directMessage";

interface MessageModelRoomDirectMessageListProps {
  isCollapsed?: boolean;
}

defineSlots<{ prepend: () => VNode }>();
const { isCollapsed = false } = defineProps<MessageModelRoomDirectMessageListProps>();
const directMessageStore = useDirectMessageStore();
const { directMessages, hasMore } = storeToRefs(directMessageStore);
const { readDirectMessages, readMoreDirectMessages } = useReadDirectMessages();
const { isPending } = await readDirectMessages();
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-collapsed :is-pending @load-more="readMoreDirectMessages">
    <template #prepend>
      <slot name="prepend" />
    </template>
    <MessageModelRoomDirectMessageListItem
      v-for="directMessage of directMessages"
      :key="directMessage.id"
      :room="directMessage"
    />
  </MessageModelRoomBaseList>
</template>
