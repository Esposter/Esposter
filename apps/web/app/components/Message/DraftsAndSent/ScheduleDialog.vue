<script setup lang="ts">
import { getComposerKey } from "#src/services/message/composer/getComposerKey";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "#src/store/message/input/index";
import { getResultAsync, noop } from "@esposter/shared";
import { parse } from "node-html-parser";

const { $trpc } = useNuxtApp();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(draftsAndSentScheduleDialogStore);
const inputStore = useInputStore();
const { clearComposer, getComposerInput, restoreDraft } = inputStore;
const { drafts } = storeToRefs(inputStore);
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
const displayText = computed(() => (target.value ? parse(target.value.content).textContent : ""));
const { executeMutation } = useMutation();
// The dialog closes, and a new message leaves the composer, at once as the schedule is sent. A refused schedule hands the
// Composer its draft back while it is still empty, and the job list is read again once the server has the job
const scheduleMessage = () => {
  const targetValue = target.value;
  if (!targetValue) return;

  executeMutation(
    () =>
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
    {
      applyOptimistic: () => {
        target.value = undefined;
        if (targetValue.scheduledMessageJobId) return noop;

        const composerTarget = { roomId: targetValue.roomId, threadRootId: targetValue.threadRootId };
        const composerKey = getComposerKey(composerTarget);
        const previousDraft = drafts.value.get(composerKey);
        clearComposer(composerTarget);
        return () => {
          if (!getComposerInput(composerTarget)) restoreDraft(composerKey, previousDraft);
        };
      },
      key: targetValue.scheduledMessageJobId || Symbol("scheduleMessage"),
      // The refresh reports its own failure rather than throwing, so a read that fails once the schedule has landed is an
      // Alert and not a rejection of the write
      reconcile: () => getResultAsync(readScheduledMessageJobs).match(noop, createErrorAlert),
    },
  );
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
