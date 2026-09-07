<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  action: AppNotificationAction;
}

const { action } = defineProps<Props>();
const emit = defineEmits<{ complete: [] }>();
const isLoading = ref(false);
</script>

<template>
  <v-btn
    :loading="isLoading"
    size="small"
    :to="action.to"
    variant="tonal"
    @click="
      async () => {
        if (isLoading) return;
        isLoading = true;
        // Complete fires only on success — a failed action leaves the button armed for a retry — and nothing
        // Awaits this handler, so the chain reports here or the failure is lost. Terminating resolves either
        // Way, which is what re-arms the spinner without a finalizer around it
        await getResultAsync(async () => {
          await action.handler?.();
          emit('complete');
        }).match(noop, createErrorAlert);
        isLoading = false;
      }
    "
    >{{ action.title }}</v-btn
  >
</template>
