<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomInviteStore } from "@/store/message/room/roomInvite";
import { useRoomInviteDialogStore } from "@/store/message/room/roomInviteDialog";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roomInviteStore = useRoomInviteStore();
const { getSlice, revokeInvite } = roomInviteStore;
const roomInviteDialogStore = useRoomInviteDialogStore();
const { revokingId } = storeToRefs(roomInviteDialogStore);
const { isOpen, item: invite } = useSingletonDialog(revokingId, () =>
  getSlice(roomId).items.value.find(({ id }) => id === revokingId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="invite"
    v-model="isOpen"
    confirm-label="Revoke"
    title="Revoke invite"
    :confirm="() => invite && revokeInvite({ id: invite.id, roomId })"
    is-optimistic
  >
    <p>
      Revoke <code>{{ invite.id }}</code
      >? Anyone holding the link stops being able to join with it.
    </p>
  </UiConfirmDialog>
</template>
