<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
import { MessageType, ROOM_NAME_MAX_LENGTH } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoom, isCreator } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const dialogStore = useDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(dialogStore);
const roomName = useRoomName(() => currentRoom.value?.id);
const placeholder = useRoomPlaceholder(currentRoom);
</script>

<template>
  <v-toolbar
    v-if="currentRoom"
    :style="{ paddingLeft: isLeftDrawerOpenAuto ? '.25rem' : undefined }"
    density="comfortable"
  >
    <MessageContentShowRoomListButton />
    <StyledEditableNameDialogButton
      v-model="isEditRoomDialogOpen"
      :card-props="{ title: 'Edit Room' }"
      :is-editable="isCreator"
      :max-length="ROOM_NAME_MAX_LENGTH"
      :name="currentRoom.name"
      :placeholder
      :tooltip-props="{ location: 'bottom', text: 'Edit Room' }"
      @submit="
        async (name) => {
          if (!currentRoom) return;
          await $trpc.room.updateRoom.mutate({ id: currentRoom.id, name });
          await createMessage({ roomId: currentRoom.id, type: MessageType.EditRoom, message: name });
        }
      "
    >
      <StyledAvatar :image="currentRoom.image" :name="roomName" :avatar-props="{ size: 'x-small' }" />
      <span pl-2>{{ roomName }}</span>
    </StyledEditableNameDialogButton>
    <template #append>
      <MessageContentNotificationSettingsMenuButton :room-id="currentRoom.id" />
      <MessageContentPinnedMessagesMenuButton />
      <MessageContentAddFriendsDialogButton />
      <MessageContentShowMemberListButton />
      <MessageContentShowSearchButton />
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
