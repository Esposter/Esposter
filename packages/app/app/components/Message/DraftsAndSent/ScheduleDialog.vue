<script setup lang="ts">
import { getTextFromHtml } from "@/services/message/draftsAndSent/getTextFromHtml";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "@/store/message/input";

const { $trpc } = useNuxtApp();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(scheduleDialogStore);
const inputStore = useInputStore();
const { clearDraft } = inputStore;
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
const executeMutation = useMutation();
// Server-scheduled job — non-optimistic, store refresh in onSuccess
const scheduleMessage = async (onComplete: () => void) => {
  const currentTarget = target.value;
  if (!currentTarget) {
    onComplete();
    return;
  }
  await executeMutation(
    () =>
      currentTarget.scheduledMessageJobId
        ? $trpc.message.scheduledMessageJob.rescheduleMessage.mutate({
            id: currentTarget.scheduledMessageJobId,
            message: currentTarget.content,
            roomId: currentTarget.roomId,
            runAt: scheduledAt.value,
          })
        : $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
            message: currentTarget.content,
            roomId: currentTarget.roomId,
            runAt: scheduledAt.value,
          }),
    {
      onSuccess: async () => {
        if (!currentTarget.scheduledMessageJobId) clearDraft(currentTarget.roomId);
        await readScheduledMessageJobs();
        target.value = undefined;
      },
    },
  );
  onComplete();
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: target?.scheduledMessageJobId ? 'Reschedule Message' : 'Schedule Message' }"
    :confirm-button-props="{ prependIcon: 'mdi-send-clock', text: 'Schedule Message' }"
    :confirm-button-attrs="{ disabled: !scheduledAt }"
    @submit="(_event, onComplete) => scheduleMessage(onComplete)"
  >
    <v-container>
      <v-row>
        <v-col cols="12">
          <StyledDatePicker
            v-model="scheduledAt"
            :date-picker-props="{ minDate: minScheduledAt, placeholder: 'Run at', sixWeeks: 'append' }"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea :model-value="target ? getTextFromHtml(target.content) : ''" label="Message" readonly />
        </v-col>
      </v-row>
    </v-container>
  </StyledFormDialog>
</template>
