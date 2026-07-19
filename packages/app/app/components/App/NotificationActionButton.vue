<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

import { withFinalizerAsync } from "@esposter/shared";

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
        // Complete fires only on success — a failed action leaves the button armed for a retry — while
        // The finalizer re-arms it unconditionally so a thrown handler can never wedge the spinner
        await withFinalizerAsync(
          async () => {
            await action.handler?.();
            if (action.to) await navigateTo(action.to);
            emit('complete');
          },
          () => {
            isLoading = false;
          },
        );
      }
    "
    >{{ action.title }}</v-btn
  >
</template>
