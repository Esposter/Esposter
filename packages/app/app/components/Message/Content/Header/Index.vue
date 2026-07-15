<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
import { MessageType, ROOM_NAME_MAX_LENGTH, selectRoomInMessageSchema } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const { smAndDown } = useVDisplay();
const layoutStore = useLayoutStore();
const { isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const { currentRoom, isCreator } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const dialogStore = useDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(dialogStore);
const roomName = useRoomName(() => currentRoom.value?.id ?? "");
const placeholder = useRoomPlaceholder(currentRoom);
const { cloned: editedImage } = useCloned(() => currentRoom.value?.image ?? "");
const executeMutation = useMutation();
const updateRoom = async (name: string) => {
  if (!currentRoom.value) return;
  const { id, image: oldImage, name: oldName } = currentRoom.value;
  const image = editedImage.value;
  const isNameChanged = name !== oldName;
  await executeMutation(() => $trpc.room.updateRoom.mutate({ id, image, name }), {
    applyOptimistic: () => {
      storeUpdateRoom({ id, image, name });
      return () => {
        storeUpdateRoom({ id, image: oldImage, name: oldName });
      };
    },
    onSuccess: async (updatedRoom) => {
      if (isNameChanged)
        await createMessage({ message: updatedRoom.name, roomId: updatedRoom.id, type: MessageType.EditRoom });
    },
  });
};
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
      :is-dirty="editedImage !== currentRoom.image"
      :schema="selectRoomInMessageSchema.shape.name"
      :placeholder
      :tooltip-props="{ location: 'bottom', text: 'Edit Room' }"
      @submit="updateRoom"
    >
      <template #prepend-content>
        <MessageContentHeaderEditRoomImageField v-model="editedImage" :name="roomName" :room-id="currentRoom.id" />
      </template>
      <StyledAvatar :image="currentRoom.image" :name="roomName" :avatar-props="{ size: 'x-small' }" />
      <div pl-2 flex flex-col>
        <span>{{ roomName }}</span>
        <span v-if="currentRoom.topic" truncate text-hint>{{ currentRoom.topic }}</span>
      </div>
    </StyledEditableNameDialogButton>
    <template #append>
      <MessageContentCallButton />
      <MessageContentNotificationSettingsMenuButton />
      <MessageContentHeaderActionButtons v-if="!smAndDown" />
      <MessageContentShowSearchButton />
      <MessageContentHeaderOverflowMenu v-if="smAndDown" />
    </template>
  </v-toolbar>
  <MessageContentHeaderDirectMessage v-else />
</template>
