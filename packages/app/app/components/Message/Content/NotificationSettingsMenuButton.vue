<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { useUserToRoomStore } from "@/store/message/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { mergeProps } from "vue";

interface NotificationSettingsMenuButtonProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<NotificationSettingsMenuButtonProps>();
const userToRoomStore = useUserToRoomStore();
const { updateUserToRoom } = userToRoomStore;
const { notificationType } = storeToRefs(userToRoomStore);
</script>

<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Notification Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="mergeProps(menuProps, tooltipProps)" icon variant="text">
            <v-icon :icon="notificationType === NotificationType.All ? 'mdi-bell' : 'mdi-bell-off'" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <StyledCard pr-2>
      <v-radio-group
        v-model="notificationType"
        hide-details
        @update:model-value="(value) => value && updateUserToRoom({ notificationType: value, roomId })"
      >
        <v-radio v-for="[value, label] of Object.entries(NotificationTypeLabelMap)" :key="value" :value :label>
          <template #label="{ props: labelProps }">
            <v-label :="labelProps" text-sm :text="label" @click="() => {}" />
          </template>
        </v-radio>
      </v-radio-group>
    </StyledCard>
  </v-menu>
</template>
