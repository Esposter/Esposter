<script setup lang="ts">
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface Props {
  roomId: RoomInMessage["id"];
  userToRoom: UserToRoomInMessage;
}

const { roomId, userToRoom } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const userToRoomStore = useUserToRoomStore();
const { setMyUserToRoom } = userToRoomStore;
const { executeMutation } = useMutation();
const editedDisplayName = ref(userToRoom.displayName);
const save = async () => {
  // The field emits save from both blur and Enter, so the same value would otherwise be written twice
  if (editedDisplayName.value === userToRoom.displayName) return;

  const newDisplayName = editedDisplayName.value;
  await executeMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ displayName: newDisplayName, roomId }), {
    applyOptimistic: () => {
      const oldDisplayName = userToRoom.displayName;
      setMyUserToRoom(roomId, { ...userToRoom, displayName: newDisplayName });
      return () => {
        setMyUserToRoom(roomId, { ...userToRoom, displayName: oldDisplayName });
      };
    },
    key: roomId,
  });
};
</script>

<template>
  <div py-4 flex flex-col gap-6 ui-body>
    <MessageModelRoomSettingsTypeProfileDisplayNameField v-model="editedDisplayName" @save="save()" />
  </div>
</template>
