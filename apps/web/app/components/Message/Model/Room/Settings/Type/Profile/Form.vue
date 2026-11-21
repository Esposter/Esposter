<script setup lang="ts">
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "#src/store/message/room/userToRoom";

interface Props {
  roomId: RoomInMessage["id"];
  userToRoom: UserToRoomInMessage;
}

const { roomId, userToRoom } = defineProps<Props>();
const userToRoomStore = useUserToRoomStore();
const { updateUserToRoom } = userToRoomStore;
const editedDisplayName = ref(userToRoom.displayName);
const save = () => {
  // The field emits save from both blur and Enter, so the same value would otherwise be written twice
  if (editedDisplayName.value === userToRoom.displayName) return;

  updateUserToRoom({ displayName: editedDisplayName.value, roomId });
};
</script>

<template>
  <div flex flex-col gap-6>
    <MessageModelRoomSettingsTypeProfileDisplayNameField v-model="editedDisplayName" @save="save()" />
  </div>
</template>
