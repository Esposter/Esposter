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
</script>

<template>
  <StyledDeleteDialog
    :card-props="
      isCreator
        ? { title: 'Delete Room', text: 'Are you sure you want to delete this room?' }
        : { title: 'Leave Room', text: 'Are you sure you want to leave this room?' }
    "
    @delete="
      async (onComplete) => {
        try {
          deleteRoom(roomId);
          isCreator ? await $client.room.deleteRoom.mutate(roomId) : await $client.room.leaveRoom.mutate(roomId);
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="activatorProps">
      <v-tooltip :text="isCreator ? 'Delete Room' : 'Leave Room'">
        <template #activator="{ props: tooltipProps }">
          <slot :="{ ...activatorProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
