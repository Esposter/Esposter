<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface ProfileProps {
  room: RoomInMessage;
}

const { room } = defineProps<ProfileProps>();
const { getMyUserToRoom } = useUserToRoomStore();
const userToRoom = computed(() => getMyUserToRoom(room.id));
</script>

<template>
  <MessageModelRoomSettingsTypeProfileForm v-if="userToRoom" :room-id="room.id" :user-to-room />
</template>
