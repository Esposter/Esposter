<script setup lang="ts">
import { MutationStatus } from "@/models/shared/MutationStatus";
import { getEarliestScheduledAt } from "@/services/message/getEarliestScheduledAt";
import { UiRules } from "@/services/ui/UiRules";
import { useScheduledMessageJobDialogStore } from "@/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "@/store/message/room";
import { ScheduledMessageJobType } from "@esposter/db-schema";
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
// Server-scheduled job — non-optimistic
const scheduleJob = async () => {
  const roomId = currentRoomId.value;
  if (!roomId) return true;

  const outcome = await executeMutation(
    () =>
      isReminder.value
        ? $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
            roomId,
            runAt: scheduledAt.value,
            text: text.value,
          })
        : $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
            message: marked.parse(text.value, { async: false }),
            roomId,
            runAt: scheduledAt.value,
          }),
    { key: Symbol("scheduleJob") },
  );
  // A failed schedule keeps the dialog open with the time and text intact so the user can retry
  return outcome.status === MutationStatus.Succeeded;
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
