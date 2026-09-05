<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { MessageType, ROOM_NAME_MAX_LENGTH, selectRoomInMessageSchema } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const { smAndDown } = useVDisplay();
const layoutStore = useLayoutStore();
const { isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const { currentRoom, isCreator, rooms } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
const roomName = useRoomName(() => currentRoom.value?.id ?? "");
const placeholder = useRoomPlaceholder(currentRoom);
const { cloned: editedImage } = useCloned(() => currentRoom.value?.image ?? "");
const { executeMutation } = useMutation();
const updateRoom = async (name: string) => {
  if (!currentRoom.value) return;
  const { id, name: currentName } = currentRoom.value;
  const image = editedImage.value;
  const isNameChanged = name !== currentName;
  await executeMutation(() => $trpc.room.updateRoom.mutate({ id, image, name }), {
    applyOptimistic: () => {
      const room = rooms.value.find(({ id: roomId }) => roomId === id);
      if (!room) return noop;

      const { image: previousImage, name: previousName } = room;
      storeUpdateRoom({ id, image, name });
      return () => {
        storeUpdateRoom({ id, image: previousImage, name: previousName });
      };
    },
    key: id,
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
    <!-- On small screens the mobile action bar above the composer owns room list, room actions, and search -->
    <MessageContentShowRoomListButton v-if="!smAndDown" />
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
      <MessageContentShowSearchButton v-if="!smAndDown" />
    </template>
  </v-toolbar>
  <MessageContentHeaderDirectMessage v-else />
</template>
