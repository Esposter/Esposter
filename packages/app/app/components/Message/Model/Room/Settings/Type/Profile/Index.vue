<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

interface ProfileProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<ProfileProps>();
const { getMyUserToRoom } = useUserToRoomStore();
const userToRoom = computed(() => getMyUserToRoom(roomId));
</script>

<template>
  <MessageModelRoomSettingsTypeProfileForm v-if="userToRoom" :room-id :user-to-room />
</template>
