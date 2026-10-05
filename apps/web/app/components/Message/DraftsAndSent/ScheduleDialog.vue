<script setup lang="ts">
import { MutationStatus } from "@/models/shared/MutationStatus";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "@/store/message/input";
import { getResultAsync, noop } from "@esposter/shared";
import { parse } from "node-html-parser";

const { $trpc } = useNuxtApp();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(draftsAndSentScheduleDialogStore);
const inputStore = useInputStore();
const { clearComposer } = inputStore;
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
const displayText = computed(() => (target.value ? parse(target.value.content).textContent : ""));
const { executeMutation } = useMutation();
// Server-scheduled job — non-optimistic, store refresh in onSuccess
const scheduleMessage = async () => {
  const targetValue = target.value;
  if (!targetValue) return true;
  const outcome = await executeMutation(
    () =>
      targetValue.scheduledMessageJobId
        ? $trpc.message.scheduledMessageJob.rescheduleMessage.mutate({
            id: targetValue.scheduledMessageJobId,
            message: targetValue.content,
            replyRowKey: targetValue.threadRootRowKey,
            roomId: targetValue.roomId,
            runAt: scheduledAt.value,
          })
        : $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
            message: targetValue.content,
            replyRowKey: targetValue.threadRootRowKey,
            roomId: targetValue.roomId,
            runAt: scheduledAt.value,
          }),
    {
      key: targetValue.scheduledMessageJobId || Symbol("scheduleMessage"),
      onSuccess: async () => {
        if (!targetValue.scheduledMessageJobId)
          clearComposer({ roomId: targetValue.roomId, threadRootRowKey: targetValue.threadRootRowKey });
        // The job is already scheduled by the time this runs, so the refresh reports its own failure rather
        // Than throwing: a rejection here rejects the write's outcome, and the dialog would sit submitting
        // Over a message the server took
        await getResultAsync(readScheduledMessageJobs).match(noop, createErrorAlert);
        target.value = undefined;
      },
    },
  );
  // A failed schedule keeps the dialog open with the chosen time intact so the user can retry
  return outcome.status === MutationStatus.Succeeded;
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Schedule Message"
    :is-confirm-disabled="!scheduledAt || undefined"
    :title="target?.scheduledMessageJobId ? 'Reschedule Message' : 'Schedule Message'"
    :submit="scheduleMessage"
  >
    <UiDateField v-model="scheduledAt" is-time label="Run at" :min="minScheduledAt" />
    <section flex flex-col gap-1>
      <h3 text-sm text-muted>Message</h3>
      <p px-3 py-2 ws-pre-wrap break-anywhere ui-field>{{ displayText }}</p>
    </section>
  </StyledFormDialog>
</template>
