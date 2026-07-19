<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

interface AppNotificationActionButtonProps {
  action: AppNotificationAction;
}

const { action } = defineProps<AppNotificationActionButtonProps>();
const emit = defineEmits<{ complete: [] }>();
const isLoading = ref(false);
</script>

<template>
  <v-btn
    :loading="isLoading"
    size="small"
    variant="tonal"
    @click="
      async () => {
        if (isLoading) return;
        isLoading = true;
        await action.handler?.();
        if (action.to) await navigateTo(action.to);
        isLoading = false;
        emit('complete');
      }
    "
    >{{ action.title }}</v-btn
  >
</template>
