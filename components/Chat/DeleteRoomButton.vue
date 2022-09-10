<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

interface DeleteRoomButtonProps {
  roomId: string;
}

const { roomId } = defineProps<DeleteRoomButtonProps>();
const client = useClient();
const roomStore = useRoomStore();
const { deleteRoom } = roomStore;
const onDeleteRoom = async () => {
  deleteRoom(roomId);
  await client.mutation("room.deleteRoom", roomId);
};
</script>

<template>
  <v-btn icon="mdi-close" size="small" flat @click="onDeleteRoom" />
</template>
