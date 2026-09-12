<script setup lang="ts">
import { APP_BAR_TOOLTIP_PROPS } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useNotificationStore } from "@/store/notification";

const { data: session } = await authClient.useSession(useFetch);
const notificationStore = useNotificationStore();
const { hasMore, isPanelOpen, notifications, unreadCount } = storeToRefs(notificationStore);
const { deleteNotifications, markAllAsRead } = notificationStore;
const { readMoreNotifications, readNotifications } = useReadNotifications();
const badge = computed(() => ({ color: "error", modelValue: unreadCount.value > 0 }));
// The delivered half is the caller's own rows, so there is nothing to read for a visitor who is not signed in
if (session.value) await readNotifications();
</script>

<template>
  <!-- The badge rides on the avatar itself (native badge prop wraps it in a v-badge) — nested inside, the
       avatar's circular overflow clip would cut the badge off -->
  <v-avatar v-if="session" :badge color="background">
    <StyledTooltipMenuIconButton
      v-model="isPanelOpen"
      aria-label="Notifications"
      icon="mdi-bell-outline"
      :menu-props="{ closeOnContentClick: false, location: 'bottom end' }"
      text="Notifications"
      :tooltip-props="APP_BAR_TOOLTIP_PROPS"
      @update:model-value="
        (value) => {
          if (!value) markAllAsRead();
        }
      "
    >
      <v-card max-w-120 min-w-88>
        <v-toolbar density="compact" title="Notifications">
          <template #append>
            <v-btn v-if="notifications.length > 0" size="small" variant="text" @click="deleteNotifications()">
              Dismiss all
            </v-btn>
          </template>
        </v-toolbar>
        <StyledEmptyState v-if="notifications.length === 0" icon="mdi-bell-outline" title="No notifications" />
        <v-list v-else max-h-120 overflow-y-auto>
          <AppNotificationBellItem v-for="notification of notifications" :key="notification.id" :notification />
          <StyledWaypoint :is-active="hasMore" @change="readMoreNotifications" />
        </v-list>
      </v-card>
    </StyledTooltipMenuIconButton>
    <!-- The count rides the slot rather than `content`: VAvatar forces `dot` on whenever no badge slot is given,
         which renders the marker as a bare dot and drops whatever content it was handed -->
    <template #badge>{{ unreadCount }}</template>
  </v-avatar>
</template>
