<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getEarliestScheduledAt } from "#src/services/message/getEarliestScheduledAt";
import { applyIfUnchanged } from "#src/services/shared/applyIfUnchanged";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { UiRules } from "#src/services/ui/UiRules";
import { useScheduledMessageJobDialogStore } from "#src/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "#src/store/message/room/index";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { marked } from "marked";

const textRules = [UiRules.required()];
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
const { isOpen, type } = storeToRefs(scheduledMessageJobDialogStore);
const scheduledAt = ref(getEarliestScheduledAt());
const minScheduledAt = ref(scheduledAt.value);
const text = ref("");
const isReminder = computed(() => type.value === ScheduledMessageJobType.Reminder);
const title = computed(() => (isReminder.value ? "Set Reminder" : "Schedule Message"));
const setDefaultScheduledAt = () => {
  scheduledAt.value = getEarliestScheduledAt();
  minScheduledAt.value = new Date(scheduledAt.value);
};
// The dialog stays open on its text until the server keeps the job, so a refused schedule is sent again from the same
// Text, and a kept one empties it for the next
const scheduleJob = async () => {
  const roomId = currentRoomId.value;
  if (!roomId) return false;

  const sentText = text.value;
  return getResultAsync(async () =>
    isReminder.value
      ? await $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
          roomId,
          runAt: scheduledAt.value,
          text: sentText,
        })
      : await $trpc.message.scheduledMessage.createScheduledMessage.mutate({
          message: marked.parse(sentText, { async: false }),
          replyToId: null,
          roomId,
          runAt: scheduledAt.value,
        }),
  ).match(
    () => {
      applyIfUnchanged(text, sentText, "");
      return true;
    },
    (error) => {
      createErrorAlert(error);
      return false;
    },
  );
};

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) setDefaultScheduledAt();
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerIssuedValue"
    :confirm-label="title"
    :is-confirm-disabled="!scheduledAt || undefined"
    :title
    :submit="scheduleJob"
  >
    <UiDateField v-model="scheduledAt" is-time label="Run at" :min="minScheduledAt" />
    <UiTextField v-model="text" :label="isReminder ? 'Reminder' : 'Message'" :rows="3" :rules="textRules" />
  </StyledFormDialog>
</template>
