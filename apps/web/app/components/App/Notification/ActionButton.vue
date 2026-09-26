<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

import { createErrorAlert } from "@/services/trpc/createErrorAlert";

interface Props {
  action: AppNotificationAction;
}

const { action } = defineProps<Props>();
const emit = defineEmits<{ complete: [] }>();
const { executeMutation, isPending } = useMutation();
// One button runs one action, so a second press while it is out joins nothing and is dropped
const key = Symbol("action");
</script>

<template>
  <UiButton
    :is-pending
    @click="
      async () => {
        // Complete fires only on success — a failed action leaves the button armed for a retry
        await executeMutation(
          async () => {
            await action.handler?.();
          },
          {
            isExclusive: true,
            key,
            onError: (error) => {
              createErrorAlert(error);
            },
            onSuccess: () => {
              emit('complete');
            },
          },
        );
        if (action.to) await navigateTo(action.to);
      }
    "
  >
    {{ action.title }}
  </UiButton>
</template>
