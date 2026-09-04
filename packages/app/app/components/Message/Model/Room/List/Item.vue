<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { getComposerTarget } from "@/services/message/composer/getComposerTarget";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomName = useRoomName(() => room.id);
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isActive = computed(() => room.id === currentRoomId.value);
// A thread's draft counts as the room's, because the room list is the only place either is surfaced — a reply
// Half-written in a thread pane is otherwise invisible until the drafts page is opened
const hasDraft = computed(
  () =>
    !isActive.value &&
    [...drafts.value.keys()].some((composerKey) => getComposerTarget(composerKey).roomId === room.id),
);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom } = userToRoomStore;
const myUserToRoom = computed(() => getMyUserToRoom(room.id));
const hasUnread = computed(() => {
  if (isActive.value) return false;
  const lastMessageAt = myUserToRoom.value?.lastMessageAt;
  return Boolean(lastMessageAt && lastMessageAt < room.updatedAt);
});
const mentionCount = computed(() => (isActive.value ? 0 : (myUserToRoom.value?.mentionCount ?? 0)));
</script>

<template>
  <MessageModelRoomBaseListItem
    :image="room.image"
    :is-active
    :is-bold="hasUnread || hasDraft ? true : undefined"
    :name="roomName"
    :room-id="room.id"
  >
    <template #append="{ isHovering }">
      <v-chip v-if="mentionCount" color="error" density="compact" size="x-small" variant="flat">
        {{ mentionCount }}
      </v-chip>
      <v-tooltip v-if="hasDraft" text="Draft">
        <template #activator="{ props: activatorProps }">
          <v-icon :="activatorProps" icon="mdi-pencil" size="x-small" op-medium-emphasis />
        </template>
      </v-tooltip>
      <v-tooltip v-if="room.isReadOnly" text="Read-only">
        <template #activator="{ props: activatorProps }">
          <v-icon :="activatorProps" icon="mdi-bullhorn-outline" size="x-small" op-medium-emphasis />
        </template>
      </v-tooltip>
      <MessageModelRoomListItemSettingsButton :is-active :is-hovering :room />
    </template>
  </MessageModelRoomBaseListItem>
</template>
