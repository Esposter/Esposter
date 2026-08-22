<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
</script>

<!-- Discord's wording and its placement: the moment someone wants another person in the room is a moment spent in
     the room, so the only invite surface is the room header — a link generated in settings would be the same act
     four navigations away -->
<template>
  <StyledDialog
    :card-props="{ prependIcon: 'mdi-account-plus', title: `Invite people to ${roomName}` }"
    :dialog-props="{ maxWidth: 500 }"
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ size: 'small' }"
        icon="mdi-account-plus"
        text="Invite People"
        :tooltip-props="{ location: 'bottom' }"
        @click="updateIsOpen(true)"
      />
    </template>
    <p m-0 op-medium-emphasis text-body-medium>
      Share your invite link to bring people into the room. Each member has one live invite link — changing its options
      replaces it.
    </p>
    <MessageModelRoomInviteManager v-if="currentRoomId" :key="currentRoomId" :room-id="currentRoomId" />
  </StyledDialog>
</template>
