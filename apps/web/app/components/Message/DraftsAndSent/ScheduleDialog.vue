<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "#src/store/message/input/index";
import { getResultAsync, noop } from "@esposter/shared";
import { parse } from "node-html-parser";

const { $trpc } = useNuxtApp();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(draftsAndSentScheduleDialogStore);
const inputStore = useInputStore();
const { clearComposer } = inputStore;
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
const displayText = computed(() => (target.value ? parse(target.value.content).textContent : ""));
// The dialog stays open until the server keeps the schedule, so a refused one leaves its message and time to send
// Again. A kept new schedule empties the composer it was written in, and the job list is read again once the
// Server has the job
const scheduleMessage = async () => {
  const targetValue = target.value;
  if (!targetValue) return false;

  return getResultAsync(() =>
    targetValue.scheduledMessageJobId
      ? $trpc.message.scheduledMessage.updateScheduledMessage.mutate({
          id: targetValue.scheduledMessageJobId,
          message: targetValue.content,
          replyToId: targetValue.threadRootId || null,
          roomId: targetValue.roomId,
          runAt: scheduledAt.value,
        })
      : $trpc.message.scheduledMessage.createScheduledMessage.mutate({
          message: targetValue.content,
          replyToId: targetValue.threadRootId || null,
          roomId: targetValue.roomId,
          runAt: scheduledAt.value,
        }),
  ).match(
    async () => {
      if (!targetValue.scheduledMessageJobId)
        clearComposer({ roomId: targetValue.roomId, threadRootId: targetValue.threadRootId });
      // The refresh reports its own failure rather than throwing, so a read that fails once the schedule has landed is
      // An Alert and not a rejection of the write
      await getResultAsync(readScheduledMessageJobs).match(noop, createErrorAlert);
      return true;
    },
    (error) => {
      createErrorAlert(error);
      return false;
    },
  );
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerIssuedValue"
    confirm-label="Schedule Message"
    :is-confirm-disabled="!scheduledAt || undefined"
    :title="target?.scheduledMessageJobId ? 'Reschedule Message' : 'Schedule Message'"
    :submit="scheduleMessage"
  >
    <UiDateField v-model="scheduledAt" is-time label="Run at" :min="minScheduledAt" />
    <section flex flex-col gap-1>
      <h3 ui-heading text-muted>Message</h3>
      <p px-3 py-2 ws-pre-wrap break-anywhere ui-field>{{ displayText }}</p>
    </section>
  </StyledFormDialog>
</template>
