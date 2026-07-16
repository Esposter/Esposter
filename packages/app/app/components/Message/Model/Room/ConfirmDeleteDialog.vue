<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

interface RoomConfirmDeleteDialogProps {
  creatorId: string;
  roomId: string;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps & { tooltipProps: Record<string, unknown> }) => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { creatorId, roomId } = defineProps<RoomConfirmDeleteDialogProps>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => creatorId === session.value?.user.id);
const roomStore = useRoomStore();
const { deleteRoom, leaveRoom } = roomStore;
const { rooms } = storeToRefs(roomStore);
// Deleting a room is irreversible (all messages/members), so the creator must type the room name to confirm
const roomName = computed(() => rooms.value.find(({ id }) => id === roomId)?.name ?? "");
</script>

<template>
  <StyledDeleteFormDialog
    v-model="modelValue"
    :card-props="{ title: isCreator ? 'Delete Room' : 'Leave Room' }"
    :confirm-button-props="{ text: isCreator ? 'Delete' : 'Leave' }"
    :confirm-name="isCreator ? roomName : undefined"
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        await withFinalizerAsync(
          async () => {
            isSuccessful = isCreator ? await deleteRoom(roomId) : await leaveRoom(roomId);
          },
          () => {
            onComplete(isSuccessful);
          },
        );
      }
    "
  >
    <template #activator="activatorProps">
      <v-tooltip :text="isCreator ? 'Delete Room' : 'Leave Room'">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="{ ...activatorProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    Are you sure you want to {{ isCreator ? "delete this room" : "leave this room" }}?
  </StyledDeleteFormDialog>
</template>
