<script setup lang="ts">
import type { Room } from "#shared/db/schema/rooms";

import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface ForwardRoomListItemProps {
  room: Room;
}

const { room } = defineProps<ForwardRoomListItemProps>();
const messageInputStore = useMessageInputStore();
const { forwardRoomIds } = storeToRefs(messageInputStore);
const isActive = ref(false);
</script>

<template>
  <v-list-item
    px-2="!"
    py-0="!"
    rd-1="!"
    cursor-pointer
    :active="isActive"
    :ripple="false"
    @click="
      () => {
        const index = forwardRoomIds.findIndex((id) => id === room.id);
        index === -1 ? forwardRoomIds.push(room.id) : forwardRoomIds.splice(index, 1);
      }
    "
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <template #prepend>
      <v-badge color="green" location="bottom end" dot>
        <StyledAvatar :image="room.image" :name="room.name" :avatar-props="{ size: 'small' }" />
      </v-badge>
    </template>
    <v-list-item-title flex justify-between items-center>
      {{ room.name }}
      <v-checkbox v-model="forwardRoomIds" :value="room.id" :ripple="false" density="compact" hide-details />
    </v-list-item-title>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-selection-control__input::before) {
  opacity: 0;
}
</style>
