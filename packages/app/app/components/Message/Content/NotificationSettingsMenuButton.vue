<script setup lang="ts">
import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mergeProps } from "vue";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { updateUserToRoom } = userToRoomStore;
const { notificationType } = storeToRefs(userToRoomStore);
</script>

<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Notification Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(menuProps, tooltipProps)"
            size="small"
            :icon="notificationType === NotificationType.All ? 'mdi-bell' : 'mdi-bell-off'"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard pr-2>
      <v-radio-group
        v-model="notificationType"
        hide-details
        @update:model-value="
          (value) => value && currentRoomId && updateUserToRoom({ roomId: currentRoomId, notificationType: value })
        "
      >
        <v-radio v-for="[value, label] of Object.entries(NotificationTypeLabelMap)" :key="value" :value :label>
          <template #label="{ props: labelProps }">
            <v-label :="labelProps" text-sm :text="label" @click="noop" />
          </template>
        </v-radio>
      </v-radio-group>
    </StyledCard>
  </v-menu>
</template>
