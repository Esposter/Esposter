<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/message/room";

interface RoomListItemProps {
  room: Room;
}

const { room } = defineProps<RoomListItemProps>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { name } = useRoomName(room);
const isActive = computed(() => room.id === currentRoomId.value);
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :value="room.id" @click="navigateTo(RoutePath.Messages(room.id))">
      <template #prepend>
        <StyledAvatar :image="room.image" :name />
      </template>
      <v-list-item-title pr-6>
        {{ name }}
      </v-list-item-title>
      <template #append>
        <MessageModelRoomSettingsDialogButton v-show="isActive || isHovering" :room-id="room.id" />
        <MessageModelRoomConfirmDeleteDialog :room-id="room.id" :creator-id="room.userId">
          <template #activator="{ updateIsOpen, tooltipProps }">
            <v-btn
              v-show="isActive || isHovering"
              bg-transparent="!"
              icon="mdi-close"
              variant="plain"
              size="small"
              :ripple="false"
              :="tooltipProps"
              @click.stop="updateIsOpen(true)"
            />
          </template>
        </MessageModelRoomConfirmDeleteDialog>
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem !important;
}
</style>
