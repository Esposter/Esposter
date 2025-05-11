<script setup lang="ts">
import type { Room } from "#shared/db/schema/rooms";

import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/esbabbler/room";

interface RoomListItemProps {
  room: Room;
}

const { room } = defineProps<RoomListItemProps>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isHovering = ref(false);
const active = computed(() => room.id === currentRoomId.value);
</script>

<template>
  <div relative @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <NuxtInvisibleLink :to="RoutePath.Messages(room.id)">
      <v-list-item :active :value="room.id">
        <template #prepend>
          <v-badge color="green" location="bottom end" dot>
            <StyledAvatar :image="room.image" :name="room.name" />
          </v-badge>
        </template>
        <v-list-item-title pr-6>
          {{ room.name }}
        </v-list-item-title>
      </v-list-item>
    </NuxtInvisibleLink>
    <EsbabblerModelRoomConfirmDeleteDialog :room-id="room.id" :creator-id="room.userId">
      <template #default="{ updateIsOpen, tooltipProps }">
        <v-btn
          absolute="!"
          top="1/2"
          right-0
          translate-y="-1/2"
          bg-transparent="!"
          icon="mdi-close"
          variant="plain"
          size="small"
          :ripple="false"
          :="tooltipProps"
          @click="updateIsOpen(true)"
        />
      </template>
    </EsbabblerModelRoomConfirmDeleteDialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem !important;
}
</style>
