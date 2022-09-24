<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

interface DeleteRoomButtonProps {
  roomId: string;
}

const props = defineProps<DeleteRoomButtonProps>();
const roomId = toRef(props, "roomId");
const client = useClient();
const roomStore = useRoomStore();
const { deleteRoom } = roomStore;
const onDeleteRoom = async () => {
  deleteRoom(roomId.value);
  await client.mutation("room.deleteRoom", roomId.value);
};
</script>

<template>
  <v-btn icon="mdi-close" size="small" flat @click="onDeleteRoom" />
</template>
