<script setup lang="ts">
import type { AppNotification } from "@/models/notification/AppNotification";

import { NotificationSeverityIconMap } from "@/services/notification/NotificationSeverityIconMap";
import { useNotificationStore } from "@/store/notification";

interface Props {
  notification: AppNotification;
}

const { notification } = defineProps<Props>();
const notificationStore = useNotificationStore();
const { consumeNotificationAction, deleteNotification } = notificationStore;
</script>

<template>
  <!-- A delivered notification carries its destination rather than an action button, so the row itself is the
    Link — there is nothing else on it to click -->
  <v-list-item :title="notification.title" :to="notification.path || undefined">
    <template #prepend>
      <v-icon :color="notification.severity" :icon="NotificationSeverityIconMap[notification.severity]" />
    </template>
    <template #subtitle>
      <div pt-1 flex flex-col gap-1 items-start>
        <span v-if="notification.body">{{ notification.body }}</span>
        <NuxtTime :datetime="notification.createdAt" relative op-medium-emphasis />
        <AppNotificationActionButton
          v-if="notification.action"
          :action="notification.action"
          @complete="consumeNotificationAction(notification.id)"
        />
      </div>
    </template>
    <template #append>
      <!-- The row is a link, so the dismiss stops the click reaching it — dismissing must not navigate -->
      <StyledTooltipIconButton
        icon="mdi-close"
        text="Dismiss"
        @click.stop.prevent="deleteNotification(notification.id)"
      />
    </template>
  </v-list-item>
</template>
