<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const isOpen = defineModel<boolean>({ default: false });
const { room } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => room.userId === session.value?.user.id);
const roomStore = useRoomStore();
const { deleteRoom, leaveRoom } = roomStore;
</script>

<template>
  <!-- Deleting a room is irreversible (all messages/members), so the creator must type the room name to confirm -->
  <UiConfirmDialog
    v-model="isOpen"
    :confirm-label="isCreator ? 'Delete' : 'Leave'"
    :confirm-name="isCreator ? room.name : undefined"
    :title="isCreator ? 'Delete room' : 'Leave room'"
    @confirm="
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
    <p>Are you sure you want to {{ isCreator ? "delete this room" : "leave this room" }}?</p>
  </UiConfirmDialog>
</template>
