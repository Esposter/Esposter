<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiRules } from "#src/services/ui/UiRules";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";
import { ROOM_NAME_MAX_LENGTH, selectRoomInMessageSchema } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const { rooms } = storeToRefs(roomStore);
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
const roomName = useRoomName(() => room.id);
const placeholder = useRoomPlaceholder(() => room);
const { cloned: editedName } = useCloned(() => room.name);
const { cloned: editedImage } = useCloned(() => room.image);
const nameRules = [UiRules.maxLength(ROOM_NAME_MAX_LENGTH), UiRules.isNotProfanity()];
// The name is compared as the server would store it, so a trailing space alone is not an edit
const isUnchanged = computed(
  () =>
    selectRoomInMessageSchema.shape.name.safeParse(editedName.value).data === room.name &&
    editedImage.value === room.image,
);
const { executeMutation } = useMutation();
const updateRoom = () => {
  const { id } = room;
  const name = editedName.value;
  const image = editedImage.value;
  executeMutation(() => $trpc.room.updateRoom.mutate({ id, image, name }), {
    applyOptimistic: () => {
      const storedRoom = rooms.value.find(({ id: roomId }) => roomId === id);
      if (!storedRoom) return noop;

      const { image: previousImage, name: previousName } = storedRoom;
      storeUpdateRoom({ id, image, name });
      return () => {
        storeUpdateRoom({ id, image: previousImage, name: previousName });
      };
    },
    key: id,
  });
};
</script>

<template>
  <StyledFormDialog
    v-model="isEditRoomDialogOpen"
    confirm-label="Save"
    :is-confirm-disabled="isUnchanged || undefined"
    :submit="updateRoom"
    title="Edit Room"
  >
    <MessageContentHeaderEditRoomImageField v-model="editedImage" :name="roomName" :room-id="room.id" />
    <UiTextField
      v-model="editedName"
      :counter="ROOM_NAME_MAX_LENGTH"
      is-autofocus
      label="Name"
      :placeholder
      :rules="nameRules"
    />
  </StyledFormDialog>
</template>
