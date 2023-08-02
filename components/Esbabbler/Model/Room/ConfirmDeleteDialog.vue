<script setup lang="ts">
import type { StyledDialogDefaultSlotProps } from "@/components/Styled/Dialog.vue";
import { useRoomStore } from "@/store/esbabbler/room";

interface RoomConfirmDeleteDialogProps {
  roomId: string;
  creatorId: string;
}

defineSlots<{
  default: (props: StyledDialogDefaultSlotProps & { tooltipProps: unknown }) => unknown;
}>();
const props = defineProps<RoomConfirmDeleteDialogProps>();
const { roomId, creatorId } = toRefs(props);
const { $client } = useNuxtApp();
const { data } = useAuth();
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
      <v-tooltip :text="isCreator ? 'Delete Room' : 'Leave Room'">
        <template #activator="{ props: tooltipProps }">
          <slot :="{ ...defaultProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
