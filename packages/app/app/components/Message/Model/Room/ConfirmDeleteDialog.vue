<script setup lang="ts">
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

defineSlots<{
  activator: (props: DialogActivatorSlotProps & { tooltipProps: Record<string, unknown> }) => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { room } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => room.userId === session.value?.user.id);
const roomStore = useRoomStore();
const { deleteRoom, leaveRoom } = roomStore;
const cardProps = computed(() => ({ title: isCreator.value ? "Delete Room" : "Leave Room" }));
const confirmButtonProps = computed(() => ({ text: isCreator.value ? "Delete" : "Leave" }));
</script>

<template>
  <!-- Deleting a room is irreversible (all messages/members), so the creator must type the room name to confirm -->
  <StyledDeleteFormDialog
    v-model="modelValue"
    :card-props
    :confirm-button-props
    :confirm-name="isCreator ? room.name : undefined"
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        await withFinalizerAsync(
          async () => {
            isSuccessful = isCreator ? await deleteRoom(room.id) : await leaveRoom(room.id);
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
