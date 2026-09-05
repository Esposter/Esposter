<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";

const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
// Resolved through the primitive so a target whose room has left the list — deleted, left, or paged out — closes
// With it rather than re-opening by itself when a later read brings it back
const { isOpen, item: room } = useSingletonDialog(inviteRoomId, () =>
  rooms.value.find(({ id }) => id === inviteRoomId.value),
);
const roomName = useRoomName(inviteRoomId);
</script>

<!-- Discord's own dialog, minus the half we have no feature for: theirs lists the sender's friends with an Invite
     each, above the link. Ours is the link, which is the part that works without a friendship -->
<template>
  <StyledDialog
    v-if="room"
    v-model="isOpen"
    :card-props="{ prependIcon: 'mdi-account-plus', title: `Invite friends to ${roomName}` }"
    :dialog-props="{ maxWidth: '31.25rem' }"
  >
    <div font-semibold text-body-large>Or send a room invite link to a friend</div>
    <MessageModelRoomInviteManager :key="room.id" :room />
  </StyledDialog>
</template>
