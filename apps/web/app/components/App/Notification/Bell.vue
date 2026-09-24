<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useNotificationStore } from "@/store/notification";

const { data: session } = await authClient.useSession(useFetch);
const notificationStore = useNotificationStore();
const { hasMore, isPanelOpen, notifications, unreadCount } = storeToRefs(notificationStore);
const { deleteNotifications, markAllAsRead } = notificationStore;
const { readMoreNotifications, readNotifications } = useReadNotifications();
// The delivered half is the caller's own rows, so there is nothing to read for a visitor who is not signed in
if (session.value) await readNotifications();
</script>

<template>
  <UiPopover
    v-if="session"
    v-model:is-open="isPanelOpen"
    :label="unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'"
    :position-area="DOCK_POPOVER_POSITION_AREA"
    px-0
    size-10
    relative
    @update:is-open="
      (value) => {
        if (!value) markAllAsRead();
      }
    "
  >
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Notifications" />
      <span v-if="unreadCount > 0" aria-hidden="true" text-xs text-background px-1 bg-error right-0 top-0 absolute>
        {{ unreadCount }}
      </span>
    </template>
    <div w="[min(30rem,80dvw)]" flex gap-2 items-center>
      <h2 text-accent flex-1>Notifications</h2>
      <UiButton v-if="notifications.length > 0" :variant="UiButtonVariant.Quiet" @click="deleteNotifications()"
        >Dismiss all</UiButton
      >
    </div>
    <p v-if="notifications.length === 0" text-muted py-4 text-center>No notifications</p>
    <ul v-else flex flex-col gap-2>
      <AppNotificationBellItem v-for="notification of notifications" :key="notification.id" :notification />
      <StyledWaypoint :is-active="hasMore" @change="readMoreNotifications" />
    </ul>
  </UiPopover>
</template>
