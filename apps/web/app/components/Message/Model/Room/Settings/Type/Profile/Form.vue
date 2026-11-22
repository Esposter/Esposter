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
const { draft: editedDisplayName, isDirty, settle } = useStoredDraft(() => userToRoom.displayName);
const save = () => {
  // The field emits save from both blur and Enter, so the same value would otherwise be written twice
  if (!isDirty.value) return;

  updateUserToRoom({ displayName: editedDisplayName.value, roomId });
  settle();
};
</script>

<template>
  <div flex flex-col gap-6>
    <MessageModelRoomSettingsTypeProfileDisplayNameField v-model="editedDisplayName" @save="save()" />
  </div>
</template>
