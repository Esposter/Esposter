<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { useUserToRoomStore } from "@/store/message/userToRoom";

interface NotificationSettingsDialogButtonProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<NotificationSettingsDialogButtonProps>();
const userToRoomStore = useUserToRoomStore();
const { updateUserToRoom } = userToRoomStore;
const { notificationType } = storeToRefs(userToRoomStore);
</script>

<template>
  <StyledDialog>
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Notification Settings">
        <template #activator="{ props }">
          <v-btn :="props" icon variant="text" @click="updateIsOpen(true)">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-container>
      <v-radio-group
        v-model="notificationType"
        @update:model-value="(value) => value && updateUserToRoom({ notificationType: value, roomId })"
      >
        <v-radio v-for="[value, label] of Object.entries(NotificationTypeLabelMap)" :key="value" :value :label />
      </v-radio-group>
    </v-container>
  </StyledDialog>
</template>
