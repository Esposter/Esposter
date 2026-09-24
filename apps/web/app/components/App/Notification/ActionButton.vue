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
  <UiButton
    :disabled="isLoading"
    @click="
      async () => {
        if (isLoading) return;
        isLoading = true;
        // Complete fires only on success — a failed action leaves the button armed for a retry — and nothing
        // Awaits this handler, so the chain reports here or the failure is lost. Terminating resolves either
        // Way, which is what re-arms the button without a finalizer around it
        await getResultAsync(async () => {
          await action.handler?.();
          emit('complete');
        }).match(noop, createErrorAlert);
        isLoading = false;
        if (action.to) await navigateTo(action.to);
      }
    "
  >
    <UiSpinner v-if="isLoading" />
    <template v-else>{{ action.title }}</template>
  </UiButton>
</template>
