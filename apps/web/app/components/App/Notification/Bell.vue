<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useNotificationStore } from "@/store/notification";

const { data: session } = await authClient.useSession(useFetch);
const notificationStore = useNotificationStore();
const { hasMore, isLoaded, isPanelOpen, notifications, unreadCount } = storeToRefs(notificationStore);
const { deleteNotifications, markAllAsRead } = notificationStore;
const { readMoreNotifications, readNotifications } = useReadNotifications();
// The delivered half is the caller's own rows, so there is nothing to read for a visitor who is not signed in. The
// Read is awaited here, so it has settled by the first render: a list still not loaded then is one whose read failed
if (session.value) await readNotifications();
</script>

<template>
  <UiPopover
    v-if="session"
    v-model:is-open="isPanelOpen"
    :label="unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'"
    :position-area="DOCK_POPOVER_POSITION_AREA"
    :variant="UiButtonVariant.Quiet"
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
      <UiBadge v-if="unreadCount > 0" :count="unreadCount" right-0 top-0 absolute />
    </template>
    <div w="[min(30rem,80dvw)]" flex gap-2 items-center>
      <h2 flex-1 ui-heading>Notifications</h2>
      <UiButton v-if="notifications.length > 0" :variant="UiButtonVariant.Quiet" @click="deleteNotifications()">
        Dismiss all
      </UiButton>
    </div>
    <ul v-if="notifications.length > 0" flex flex-col gap-3>
      <AppNotificationBellItem v-for="notification of notifications" :key="notification.id" :notification />
    </ul>
    <UiErrorState v-else-if="!isLoaded" error="Your notifications could not be loaded." @retry="readNotifications()" />
    <UiEmptyState
      v-else
      description="Whatever needs your attention lands here."
      :meaning="UiIconMeaning.Notifications"
      title="You're all caught up"
    />
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreNotifications(onComplete)" />
  </UiPopover>
</template>
