<script setup lang="ts">
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

interface ProfileFormProps {
  roomId: RoomInMessage["id"];
  userToRoom: UserToRoomInMessage;
}

const { roomId, userToRoom } = defineProps<ProfileFormProps>();
const { $trpc } = useNuxtApp();
const nickname = ref(userToRoom.nickname);
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
        <MessageModelRoomSettingsTypeProfileNicknameField
          v-model="nickname"
          @save="$trpc.userToRoom.updateUserToRoom.mutate({ nickname, roomId })"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
