<script setup lang="ts">
import { getEarliestScheduledAt } from "#src/services/message/getEarliestScheduledAt";
import { UiRules } from "#src/services/ui/UiRules";
import { useScheduledMessageJobDialogStore } from "#src/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "#src/store/message/room/index";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
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
const { executeMutation } = useMutation();
// The dialog closes as the job is sent. A refused schedule is the write's alert, and the text stays in the dialog, so
// Opening it again retries from the earliest time
const scheduleJob = () => {
  const roomId = currentRoomId.value;
  if (!roomId) return;

  executeMutation(
    async () =>
      isReminder.value
        ? await $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
            roomId,
            runAt: scheduledAt.value,
            text: text.value,
          })
        : await $trpc.message.scheduledMessage.createScheduledMessage.mutate({
            message: marked.parse(text.value, { async: false }),
            replyToId: null,
            roomId,
            runAt: scheduledAt.value,
          }),
    { applyOptimistic: () => noop, key: Symbol("scheduleJob") },
  );
};

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) setDefaultScheduledAt();
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :confirm-label="title"
    :is-confirm-disabled="!scheduledAt || undefined"
    :title
    :submit="scheduleJob"
  >
    <UiDateField v-model="scheduledAt" is-time label="Run at" :min="minScheduledAt" />
    <UiTextField v-model="text" :label="isReminder ? 'Reminder' : 'Message'" :rows="3" :rules="textRules" />
  </StyledFormDialog>
</template>
