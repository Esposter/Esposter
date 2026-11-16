<script setup lang="ts">
import type { AppNotificationAction } from "#src/models/notification/AppNotificationAction";

import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getSynchronizedFunction, noop } from "@esposter/shared";

interface Props {
  action: AppNotificationAction;
}

const { action } = defineProps<Props>();
const emit = defineEmits<{ complete: [] }>();
const { executeMutation, isPending } = useMutation();
// One button runs one action, so a second press while it is out joins nothing and is dropped
const key = Symbol("action");
const navigateToAction = getSynchronizedFunction(async (to: string) => {
  await navigateTo(to);
});
// The notification hides and its navigation runs at once, beside the action. The action answers on its own, and a
// Failure is an alert, so nothing waits on it
const runAction = () => {
  emit("complete");
  if (action.to) navigateToAction(action.to);
  executeMutation(
    async () => {
      await action.handler?.();
    },
    {
      applyOptimistic: () => noop,
      isExclusive: true,
      key,
      onError: (error) => {
        createErrorAlert(error);
      },
    },
  );
};
</script>

<template>
  <UiButton :is-pending @click="runAction()">
    {{ action.title }}
  </UiButton>
</template>
