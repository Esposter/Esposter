<script setup lang="ts">
import type { AppNotification } from "@/models/notification/AppNotification";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStatusIconMeaningMap } from "@/services/ui/UiStatusIconMeaningMap";
import { useNotificationStore } from "@/store/notification";

interface Props {
  notification: AppNotification;
}

const { notification } = defineProps<Props>();
const notificationStore = useNotificationStore();
const { consumeNotificationAction, deleteNotification } = notificationStore;
</script>

<!-- Its mark, title, age and dismissal on one line, as a row of any list, and what it says and asks of the reader under
     the title, so a panel of them scans down one column of titles -->
<template>
  <li flex flex-col gap-1>
    <div flex gap-2 items-center>
      <!-- The severity is the mark as well as its colour, so it reads without telling the colours apart -->
      <span :style="{ color: `var(--ui-${notification.severity})` }" flex shrink-0>
        <UiIcon :meaning="UiStatusIconMeaningMap[notification.severity]" />
      </span>
      <!-- A delivered notification carries its destination rather than an action button, so its title is the link -->
      <NuxtInvisibleLink v-if="notification.path" :to="notification.path" flex-1 min-w-0 truncate hover:underline>
        {{ notification.title }}
      </NuxtInvisibleLink>
      <span v-else flex-1 min-w-0 truncate>{{ notification.title }}</span>
      <NuxtTime :datetime="notification.createdAt" text-sm text-muted shrink-0 relative />
      <UiIconButton
        label="Dismiss"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="deleteNotification(notification.id)"
      />
    </div>
    <div v-if="notification.body || notification.action" pl-8 flex flex-col gap-2 items-start>
      <span v-if="notification.body" text-muted>{{ notification.body }}</span>
      <AppNotificationActionButton
        v-if="notification.action"
        :action="notification.action"
        @complete="consumeNotificationAction(notification.id)"
      />
    </div>
  </li>
</template>
