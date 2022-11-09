<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

interface DeleteRoomButtonProps {
  roomId: string;
}

const props = defineProps<DeleteRoomButtonProps>();
const { roomId } = $(toRefs(props));
const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { deleteRoom } = roomStore;
const onDeleteRoom = async () => {
  deleteRoom(roomId);
  await $client.room.deleteRoom.mutate(roomId);
};
</script>

<template>
  <v-btn icon="mdi-close" size="small" flat @click="onDeleteRoom" />
</template>
