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
const editedNickname = ref(userToRoom.nickname);
const save = async () => {
  // The field emits save from both blur and Enter, so the same value would otherwise be written twice
  if (editedNickname.value === userToRoom.nickname) return;

  const newNickname = editedNickname.value;
  await executeMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ nickname: newNickname, roomId }), {
    applyOptimistic: () => {
      const oldNickname = userToRoom.nickname;
      setMyUserToRoom(roomId, { ...userToRoom, nickname: newNickname });
      return () => {
        setMyUserToRoom(roomId, { ...userToRoom, nickname: oldNickname });
      };
    },
    key: roomId,
  });
};
</script>

<template>
  <div py-4 flex flex-col gap-6 ui-body>
    <MessageModelRoomSettingsTypeProfileNicknameField v-model="editedNickname" @save="save()" />
  </div>
</template>
