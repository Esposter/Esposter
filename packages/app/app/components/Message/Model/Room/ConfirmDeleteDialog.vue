<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

import { getResultAsync } from "#shared/util/getResultAsync";
import { withFinalizer } from "#shared/util/withFinalizer";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";

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
</script>

<template>
  <StyledDeleteFormDialog
    v-model="modelValue"
    :card-props="
      isCreator
        ? { title: 'Delete Room', text: 'Are you sure you want to delete this room?' }
        : { title: 'Leave Room', text: 'Are you sure you want to leave this room?' }
    "
    :confirm-button-props="{ text: isCreator ? 'Delete' : 'Leave' }"
    @delete="
      async (onComplete) => {
        await withFinalizer(
          getResultAsync(() => (isCreator ? deleteRoom(roomId) : leaveRoom(roomId))),
          () => getResultAsync(onComplete),
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
  </StyledDeleteFormDialog>
</template>
