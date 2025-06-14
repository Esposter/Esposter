<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/esbabbler/room";

interface RoomConfirmDeleteDialogProps {
  creatorId: string;
  roomId: string;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps & { tooltipProps: Record<string, unknown> }) => unknown;
}>();
const { creatorId, roomId } = defineProps<RoomConfirmDeleteDialogProps>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === creatorId);
const roomStore = useRoomStore();
const { deleteRoom, leaveRoom } = roomStore;
</script>

<template>
  <StyledDeleteDialog
    :card-props="
      isCreator
        ? { title: 'Delete Room', text: 'Are you sure you want to delete this room?' }
        : { title: 'Leave Room', text: 'Are you sure you want to leave this room?' }
    "
    :confirm-button-props="{ text: isCreator ? 'Delete' : 'Leave' }"
    @delete="
      async (onComplete) => {
        try {
          await (isCreator ? deleteRoom(roomId) : leaveRoom(roomId));
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
