<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { mergeProps } from "vue";

interface RoomWelcomeProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomWelcomeProps>();
const roomName = useRoomName(() => room.id);
</script>

<template>
  <div ma-auto px-6 py-10 text-center flex flex-col max-w-110 items-center>
    <StyledAvatar :image="room.image" :name="roomName" :avatar-props="{ size: 72 }" />
    <h2 mt-4 text-title-large>{{ roomName }}</h2>
    <p v-if="room.topic" mb-0 mt-1 op-medium-emphasis>{{ room.topic }}</p>
    <p v-else mb-0 mt-1 op-medium-emphasis>No messages yet.</p>
    <div mt-5 flex gap-x-2 items-center justify-center>
      <MessageContentCallButton />
      <MessageContentAddFriendsDialogButton />
      <MessageModelRoomSettingsDialogButton :room-id="room.id">
        <template #activator="activatorProps">
          <v-tooltip location="bottom" text="Room Settings">
            <template #activator="{ props }">
              <v-btn :="mergeProps(activatorProps, props)" icon="mdi-cog" size="small" />
            </template>
          </v-tooltip>
        </template>
      </MessageModelRoomSettingsDialogButton>
    </div>
  </div>
</template>
