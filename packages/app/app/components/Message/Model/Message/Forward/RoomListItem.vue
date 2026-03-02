<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useForwardStore } from "@/store/message/forward";

interface ForwardRoomListItemProps {
  room: Room;
}

const { room } = defineProps<ForwardRoomListItemProps>();
const forwardStore = useForwardStore();
const { roomIds } = storeToRefs(forwardStore);
const roomName = useRoomName(() => room.id);
const isActive = ref(false);
</script>

<template>
  <v-list-item
    px-2
    py-0
    rd
    cursor-pointer
    :active="isActive"
    :ripple="false"
    @click="
      () => {
        const index = roomIds.findIndex((id) => id === room.id);
        index === -1 ? roomIds.push(room.id) : roomIds.splice(index, 1);
      }
    "
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <template #prepend>
      <StyledAvatar :image="room.image" :name="roomName" :avatar-props="{ size: 'small' }" />
    </template>
    <v-list-item-title flex justify-between items-center>
      {{ roomName }}
      <v-checkbox v-model="roomIds" :value="room.id" :ripple="false" density="compact" hide-details @click.stop />
    </v-list-item-title>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-selection-control__input::before) {
  opacity: 0;
}
</style>
