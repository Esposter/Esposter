<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useNotificationStore } from "@/store/notification";
import { mergeProps } from "vue";

const { data: session } = await authClient.useSession(useFetch);
const notificationStore = useNotificationStore();
const { isPanelOpen, notifications, unreadCount } = storeToRefs(notificationStore);
const { deleteNotifications, markAllAsRead } = notificationStore;
</script>

<template>
  <v-menu
    v-if="session"
    v-model="isPanelOpen"
    location="bottom end"
    :close-on-content-click="false"
    @update:model-value="
      (value) => {
        if (!value) markAllAsRead();
      }
    "
  >
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Notifications">
        <template #activator="{ props: tooltipProps }">
          <!-- The badge rides on the avatar itself (native badge prop wraps it in a v-badge) —
            Nested inside, the avatar's circular overflow clip would cut the badge off -->
          <v-avatar color="background" :badge="{ color: 'error', content: unreadCount, modelValue: unreadCount > 0 }">
            <v-btn aria-label="Notifications" icon :="mergeProps(menuProps, tooltipProps)">
              <v-icon icon="mdi-bell-outline" />
            </v-btn>
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
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
      </v-list>
    </v-card>
  </v-menu>
</template>
