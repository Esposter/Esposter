<script setup lang="ts">
import { useRoomStore } from "@/store/chat/useRoomStore";

interface RoomConfirmDeleteDialogProps {
  roomId: string;
  creatorId: string;
}

const props = defineProps<RoomConfirmDeleteDialogProps>();
const { roomId, creatorId } = toRefs(props);
const { $client } = useNuxtApp();
const { data } = useSession();
const isCreator = computed(() => data.value?.user.id === creatorId.value);
const roomStore = useRoomStore();
const { deleteRoom } = roomStore;
const onDeleteRoom = async () => {
  deleteRoom(roomId.value);
  isCreator.value
    ? await $client.room.deleteRoom.mutate(roomId.value)
    : await $client.room.leaveRoom.mutate(roomId.value);
};
</script>

<template>
  <StyledDeleteDialog
    :card-props="
      isCreator
        ? { title: 'Delete Room', text: 'Are you sure you want to delete this room?' }
        : { title: 'Leave Room', text: 'Are you sure you want to leave this room?' }
    "
    @delete="onDeleteRoom"
  >
    <template #default="defaultProps">
      <v-tooltip location="top" :text="isCreator ? 'Delete Room' : 'Leave Room'">
        <template #activator="{ props: tooltipProps }">
          <slot :="{ ...defaultProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
