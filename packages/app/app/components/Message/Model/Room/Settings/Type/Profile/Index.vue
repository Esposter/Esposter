<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface ProfileProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<ProfileProps>();
const { data: session } = await authClient.useSession(useFetch);
const userId = computed(() => session.value?.user.id);
const userToRoomStore = useUserToRoomStore();
const { getUserToRoomMap, updateUserToRoom } = userToRoomStore;
const nickname = ref(userId.value ? (getUserToRoomMap(roomId)?.get(userId.value)?.nickname ?? "") : "");
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
