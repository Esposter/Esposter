<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { RoutePath } from "@esposter/shared";

interface RoomListItemProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomListItemProps>();
const roomName = useRoomName(() => room.id);
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isActive = computed(() => room.id === currentRoomId.value);
const hasDraft = computed(() => drafts.value.has(room.id) && room.id !== currentRoomId.value);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const hasUnread = computed(() => {
  if (isActive.value) return false;
  const lastMessageAt = getMyUserToRoom(room.id)?.lastMessageAt;
  return lastMessageAt && lastMessageAt < room.updatedAt;
});
const mentionCount = computed(() => (isActive.value ? 0 : (getMyUserToRoom(room.id)?.mentionCount ?? 0)));
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" :active="isActive" :value="room.id" @click="navigateTo(RoutePath.Messages(room.id))">
      <template #prepend>
        <StyledAvatar :image="room.image" :name="roomName" />
      </template>
      <v-list-item-title pr-6 :class="hasUnread || hasDraft ? 'font-weight-bold' : undefined">
        {{ roomName }}
      </v-list-item-title>
      <template #append>
        <v-chip v-if="mentionCount" color="error" density="compact" size="x-small" variant="flat">
          {{ mentionCount }}
        </v-chip>
        <v-tooltip v-if="hasDraft" text="Draft" location="top">
          <template #activator="{ props: activatorProps }">
            <v-icon :="activatorProps" icon="mdi-pencil" size="x-small" op-medium-emphasis />
          </template>
        </v-tooltip>
        <v-tooltip v-if="room.isReadOnly" text="Read-only" location="top">
          <template #activator="{ props: activatorProps }">
            <v-icon :="activatorProps" icon="mdi-bullhorn-outline" size="x-small" op-medium-emphasis />
          </template>
        </v-tooltip>
        <MessageModelRoomListItemSettingsButton :is-active :is-hovering="isHovering" :room />
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped>
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
