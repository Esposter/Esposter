<script setup lang="ts">
import { RoutePath } from "@esposter/shared";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
</script>

<template>
  <div flex flex-col h-full>
    <MessageLeftSideBarHeader />
    <v-divider />
    <div flex-1 overflow-y-auto>
      <v-list-item font-bold :to="RoutePath.MessagesFriends">Friends</v-list-item>
      <v-divider />
      <MessageLeftSideBarRooms />
      <v-divider />
      <template v-if="currentRoomId">
        <MessageVoicePanel />
        <v-divider />
      </template>
      <MessageLeftSideBarDirectMessages />
    </div>
    <MessageLeftSideBarStatusBar />
  </div>
</template>
