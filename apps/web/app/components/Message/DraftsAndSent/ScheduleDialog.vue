<script setup lang="ts">
import { MutationStatus } from "@/models/shared/MutationStatus";
import { getTextFromHtml } from "@/services/message/draftsAndSent/getTextFromHtml";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "@/store/message/input";
import { getResultAsync, noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(scheduleDialogStore);
const inputStore = useInputStore();
const { clearComposer } = inputStore;
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
const cardProps = computed(() => ({
  title: target.value?.scheduledMessageJobId ? "Reschedule Message" : "Schedule Message",
}));
const confirmButtonAttrs = computed(() => ({ disabled: !scheduledAt.value }));
const displayText = computed(() => (target.value ? getTextFromHtml(target.value.content) : ""));
const datePickerProps = computed(() => ({
  minDate: minScheduledAt.value,
  placeholder: "Run at",
  sixWeeks: "append" as const,
}));
const { executeMutation } = useMutation();
// Server-scheduled job — non-optimistic, store refresh in onSuccess
const scheduleMessage = async (onComplete: (isSuccessful?: boolean) => void) => {
  const currentTarget = target.value;
  if (!currentTarget) {
    onComplete();
    return;
  }
  const outcome = await executeMutation(
    () =>
      currentTarget.scheduledMessageJobId
        ? $trpc.message.scheduledMessageJob.rescheduleMessage.mutate({
            id: currentTarget.scheduledMessageJobId,
            message: currentTarget.content,
            replyRowKey: currentTarget.threadRootRowKey,
            roomId: currentTarget.roomId,
            runAt: scheduledAt.value,
          })
        : $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
            message: currentTarget.content,
            replyRowKey: currentTarget.threadRootRowKey,
            roomId: currentTarget.roomId,
            runAt: scheduledAt.value,
          }),
    {
      key: currentTarget.scheduledMessageJobId || Symbol("scheduleMessage"),
      onSuccess: async () => {
        if (!currentTarget.scheduledMessageJobId)
          clearComposer({ roomId: currentTarget.roomId, threadRootRowKey: currentTarget.threadRootRowKey });
        // The job is already scheduled by the time this runs, so the refresh reports its own failure rather
        // Than throwing: a rejection here rejects the write's outcome, and the dialog would sit submitting
        // Over a message the server took
        await getResultAsync(readScheduledMessageJobs).match(noop, createErrorAlert);
        target.value = undefined;
      },
    },
  );
  // A failed schedule keeps the dialog open with the chosen time intact so the user can retry
  onComplete(outcome.status === MutationStatus.Succeeded);
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props
    :confirm-button-props="{ prependIcon: 'i-mdi:send-clock', text: 'Schedule Message' }"
    :confirm-button-attrs
    @submit="(_event, onComplete) => scheduleMessage(onComplete)"
  >
    <StyledDatePicker v-model="scheduledAt" :date-picker-props />
    <v-textarea :model-value="displayText" label="Message" readonly />
  </StyledFormDialog>
</template>
