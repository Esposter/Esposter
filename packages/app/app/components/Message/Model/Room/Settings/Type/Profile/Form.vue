<script setup lang="ts">
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface ProfileFormProps {
  roomId: RoomInMessage["id"];
  userToRoom: UserToRoomInMessage;
}

const { roomId, userToRoom } = defineProps<ProfileFormProps>();
const { $trpc } = useNuxtApp();
const userToRoomStore = useUserToRoomStore();
const { setMyUserToRoom } = userToRoomStore;
const { executeMutation } = useMutation();
const nickname = ref(userToRoom.nickname);
const save = async () => {
  const newNickname = nickname.value;
  await executeMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ nickname: newNickname, roomId }), {
    applyOptimistic: () => {
      const oldNickname = userToRoom.nickname;
      setMyUserToRoom(roomId, { ...userToRoom, nickname: newNickname });
      return () => {
        setMyUserToRoom(roomId, { ...userToRoom, nickname: oldNickname });
      };
    },
  });
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>My Profile</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeProfileNicknameField v-model="nickname" @save="save()" />
      </v-col>
    </v-row>
  </v-container>
</template>
