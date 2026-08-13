<script setup lang="ts">
import {
  NOTIFICATION_SNACKBAR_PERSISTENT_TIMEOUT,
  NOTIFICATION_SNACKBAR_TIMEOUT_MS,
} from "@/services/notification/constants";
import { NotificationSeverityIconMap } from "@/services/notification/NotificationSeverityIconMap";
import { useNotificationStore } from "@/store/notification";

const notificationStore = useNotificationStore();
const { snackbarNotification } = storeToRefs(notificationStore);
const { consumeNotificationAction, deleteSnackbar } = notificationStore;
// Closing (timeout or dismiss) pops the queue head, so the next queued notification toasts
const isOpen = computed({
  get: () => Boolean(snackbarNotification.value),
  set: (value) => {
    if (!value && snackbarNotification.value) deleteSnackbar(snackbarNotification.value.id);
  },
});
const timeout = computed(() =>
  snackbarNotification.value?.severity === "error"
    ? NOTIFICATION_SNACKBAR_PERSISTENT_TIMEOUT
    : NOTIFICATION_SNACKBAR_TIMEOUT_MS,
);
</script>

<template>
  <!-- Keyed by id so consecutive notifications remount the snackbar and restart its timer -->
  <v-snackbar v-if="snackbarNotification" :key="snackbarNotification.id" v-model="isOpen" :timeout>
    <div flex gap-2 items-center>
      <v-icon
        :color="snackbarNotification.severity"
        :icon="NotificationSeverityIconMap[snackbarNotification.severity]"
      />
      <span>{{ snackbarNotification.title }}</span>
    </div>
    <template #actions>
      <AppNotificationActionButton
        v-if="snackbarNotification.action"
        :action="snackbarNotification.action"
        @complete="
          () => {
            if (!snackbarNotification) return;
            consumeNotificationAction(snackbarNotification.id);
            isOpen = false;
          }
        "
      />
      <StyledTooltipIconButton icon="mdi-close" text="Dismiss" @click="isOpen = false" />
    </template>
  </v-snackbar>
</template>
