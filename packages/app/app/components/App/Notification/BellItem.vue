<script setup lang="ts">
import type { AppNotification } from "@/models/notification/AppNotification";

import { NotificationSeverityIconMap } from "@/services/notification/NotificationSeverityIconMap";
import { useNotificationStore } from "@/store/notification";

interface AppNotificationBellItemProps {
  notification: AppNotification;
}

const { notification } = defineProps<AppNotificationBellItemProps>();
const notificationStore = useNotificationStore();
const { consumeNotificationAction, deleteNotification } = notificationStore;
</script>

<template>
  <v-list-item :title="notification.title">
    <template #prepend>
      <v-icon :color="notification.severity" :icon="NotificationSeverityIconMap[notification.severity]" />
    </template>
    <template #subtitle>
      <div pt-1 flex flex-col gap-1 items-start>
        <span v-if="notification.message">{{ notification.message }}</span>
        <NuxtTime :datetime="notification.createdAt" relative op-medium-emphasis />
        <AppNotificationActionButton
          v-if="notification.action"
          :action="notification.action"
          @complete="consumeNotificationAction(notification.id)"
        />
      </div>
    </template>
    <template #append>
      <StyledTooltipIconButton icon="mdi-close" text="Dismiss" @click="deleteNotification(notification.id)" />
    </template>
  </v-list-item>
</template>
