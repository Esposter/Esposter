<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useLayoutStore } from "@/store/layout";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
import { MessageType, ROOM_NAME_MAX_LENGTH } from "@esposter/db-schema";

const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoom, currentRoomId, currentRoomName, isCreator, placeholderRoomName } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const dialogStore = useDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(dialogStore);
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
      :placeholder="placeholderRoomName"
      :tooltip-props="{ location: 'bottom', text: 'Edit Room' }"
      @submit="
        async (name) => {
          if (!currentRoomId) return;
          await $trpc.room.updateRoom.mutate({ id: currentRoomId, name });
          await createMessage({ roomId: currentRoomId, type: MessageType.EditRoom, message: name });
        }
      "
    >
      <StyledAvatar :image="currentRoom.image" :name="currentRoomName" :avatar-props="{ size: 'x-small' }" />
      <span pl-2>{{ currentRoomName }}</span>
    </StyledEditableNameDialogButton>
    <template #append>
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
