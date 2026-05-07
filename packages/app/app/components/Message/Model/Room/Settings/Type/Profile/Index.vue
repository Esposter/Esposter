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
const { getUserToRoomMap } = useUserToRoomStore();
const userToRoom = computed(() => (userId.value ? getUserToRoomMap(roomId)?.get(userId.value) : undefined));
</script>

<template>
  <MessageModelRoomSettingsTypeProfileForm v-if="userToRoom" :room-id :user-to-room />
</template>
