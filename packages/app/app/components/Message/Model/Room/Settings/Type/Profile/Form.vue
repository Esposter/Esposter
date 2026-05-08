<script setup lang="ts">
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface ProfileFormProps {
  roomId: RoomInMessage["id"];
  userToRoom: UserToRoomInMessage;
}

const { roomId, userToRoom } = defineProps<ProfileFormProps>();
const { updateUserToRoom } = useUserToRoomStore();
const nickname = ref(userToRoom.nickname);
const save = async () => {
  await updateUserToRoom({ nickname: nickname.value, roomId });
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div text-lg font-bold>My Profile</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeProfileNicknameField v-model="nickname" @save="save()" />
      </v-col>
    </v-row>
  </v-container>
</template>
