<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

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
const hasDraft = computed(() => drafts.value.has(room.id) && !isActive.value);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const myUserToRoom = computed(() => getMyUserToRoom(room.id));
const hasUnread = computed(() => {
  if (isActive.value) return false;
  const lastMessageAt = myUserToRoom.value?.lastMessageAt;
  return Boolean(lastMessageAt && lastMessageAt < room.updatedAt);
});
const mentionCount = computed(() => (isActive.value ? 0 : (myUserToRoom.value?.mentionCount ?? 0)));
const isBold = computed(() => (hasUnread.value || hasDraft.value ? true : undefined));
</script>

<template>
  <MessageModelRoomBaseListItem :image="room.image" :is-active :is-bold :name="roomName" :room-id="room.id">
    <template #append="{ isHovering }">
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
      <MessageModelRoomListItemSettingsButton :is-active :is-hovering :room />
    </template>
  </MessageModelRoomBaseListItem>
</template>
