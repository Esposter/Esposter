<script setup lang="ts">
import { TOAST_DURATION_MS } from "@/services/ui/constants";
import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";

const notificationStore = useNotificationStore();
const { snackbarNotification } = storeToRefs(notificationStore);
const { consumeNotificationAction, deleteSnackbar } = notificationStore;
</script>

<template>
  <!-- Keyed by id so consecutive notifications remount the toast and restart its timer. Closing pops the queue's
       head, so the next queued notification toasts; an error stays until it is dismissed. Its severity is a status,
       so the toast draws the status's own mark -->
  <UiToast
    v-if="snackbarNotification"
    :key="snackbarNotification.id"
    :duration-ms="snackbarNotification.severity === NotificationSeverity.Error ? undefined : TOAST_DURATION_MS"
    is-dismissible
    :status="snackbarNotification.severity"
    @close="deleteSnackbar(snackbarNotification.id)"
  >
    {{ snackbarNotification.title }}
    <template v-if="snackbarNotification.action" #actions>
      <AppNotificationActionButton
        :action="snackbarNotification.action"
        @complete="
          () => {
            if (!snackbarNotification) return;
            const { id } = snackbarNotification;
            consumeNotificationAction(id);
            deleteSnackbar(id);
          }
        "
      />
    </template>
  </UiToast>
</template>
