<script setup lang="ts">
import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { mergeProps } from "vue";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { myUserToRoomMap } = storeToRefs(userToRoomStore);
const notificationType = computed(() => myUserToRoomMap.value?.notificationType ?? NotificationType.DirectMessage);
</script>

<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Notification Settings">
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
        :model-value="notificationType"
        hide-details
        @update:model-value="
          currentRoomId &&
          $trpc.userToRoom.updateUserToRoom.mutate({
            notificationType: $event as NotificationType,
            roomId: currentRoomId,
          })
        "
      >
        <v-radio v-for="[value, label] of Object.entries(NotificationTypeLabelMap)" :key="value" :value :label>
          <template #label="{ props: labelProps }">
            <v-label :="labelProps" text-label-large :text="label" />
          </template>
        </v-radio>
      </v-radio-group>
    </StyledCard>
  </v-menu>
</template>
