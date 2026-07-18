<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

interface AppNotificationActionButtonProps {
  action: AppNotificationAction;
}

const { action } = defineProps<AppNotificationActionButtonProps>();
</script>

<template>
  <v-btn
    size="small"
    variant="tonal"
    @click="
      async () => {
        await action.handler?.();
        if (action.to) navigateTo(action.to);
      }
    "
    >{{ action.title }}</v-btn
  >
</template>
