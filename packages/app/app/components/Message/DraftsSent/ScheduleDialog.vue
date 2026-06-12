<script setup lang="ts">
import { getTextFromHtml } from "@/services/message/draftsSent/getTextFromHtml";
import { useDraftsSentScheduleDialogStore } from "@/store/message/draftsSent/scheduleDialog";
import { useInputStore } from "@/store/message/input";
import { withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const scheduleDialogStore = useDraftsSentScheduleDialogStore();
const { isOpen, minScheduledAt, scheduledAt, target } = storeToRefs(scheduleDialogStore);
const inputStore = useInputStore();
const { clearDraft } = inputStore;
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: target?.scheduledMessageJobId ? 'Reschedule Message' : 'Schedule Message' }"
    :confirm-button-props="{ prependIcon: 'mdi-send-clock', text: 'Schedule Message' }"
    :confirm-button-attrs="{ disabled: !scheduledAt }"
    @submit="
      (_event, onComplete) =>
        withFinalizerAsync(async () => {
          if (!target) return;
          if (target.scheduledMessageJobId)
            await $trpc.message.scheduledMessageJob.rescheduleMessage.mutate({
              id: target.scheduledMessageJobId,
              message: target.content,
              roomId: target.roomId,
              runAt: scheduledAt,
            });
          else {
            await $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
              message: target.content,
              roomId: target.roomId,
              runAt: scheduledAt,
            });
            clearDraft(target.roomId);
          }
          await readScheduledMessageJobs();
          target = undefined;
        }, onComplete)
    "
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
