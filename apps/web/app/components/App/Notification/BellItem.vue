<script setup lang="ts">
import type { AppNotification } from "@/models/notification/AppNotification";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <li flex gap-2 items-start>
    <!-- The severity is the mark as well as its colour, so it reads without telling the colours apart -->
    <span
      :class="NotificationSeverityIconMap[notification.severity]"
      :style="{ color: `var(--ui-${notification.severity})` }"
      aria-hidden="true"
      shrink-0
      size-6
    />
    <div flex flex-1 flex-col gap-1 min-w-0 items-start>
      <!-- A delivered notification carries its destination rather than an action button, so its title is the link -->
      <NuxtInvisibleLink v-if="notification.path" :to="notification.path" hover:underline>
        {{ notification.title }}
      </NuxtInvisibleLink>
      <span v-else>{{ notification.title }}</span>
      <span v-if="notification.body" text-muted>{{ notification.body }}</span>
      <NuxtTime :datetime="notification.createdAt" text-sm text-muted relative />
      <AppNotificationActionButton
        v-if="notification.action"
        :action="notification.action"
        @complete="consumeNotificationAction(notification.id)"
      />
    </div>
    <UiIconButton
      label="Dismiss"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="deleteNotification(notification.id)"
    />
  </li>
</template>
