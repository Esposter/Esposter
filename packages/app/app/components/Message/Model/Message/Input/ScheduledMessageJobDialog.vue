<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { useScheduledMessageJobDialogStore } from "@/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "@/store/message/room";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { marked } from "marked";

const rules = useVRules();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
const { isOpen, type } = storeToRefs(scheduledMessageJobDialogStore);
const scheduledAt = ref(dayjs().add(1, "minute").toDate());
const minScheduledAt = ref(scheduledAt.value);
const text = ref("");
const isReminder = computed(() => type.value === ScheduledMessageJobType.Reminder);
const title = computed(() => (isReminder.value ? "Set Reminder" : "Schedule Message"));
const textLabel = computed(() => (isReminder.value ? "Reminder" : "Message"));
const setDefaultScheduledAt = () => {
  scheduledAt.value = dayjs().add(1, "minute").toDate();
  minScheduledAt.value = new Date(scheduledAt.value);
};
const { executeMutation } = useMutation();
// Server-scheduled job — non-optimistic
const scheduleJob = async (onComplete: () => void) => {
  const roomId = currentRoomId.value;
  if (roomId)
    await executeMutation(
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
      // A brand-new scheduled job has no id yet, so each gets a per-call symbol
      { key: Symbol("scheduleJob") },
    );
  onComplete();
};

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) setDefaultScheduledAt();
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title }"
    :confirm-button-props="{ text: title, prependIcon: isReminder ? 'mdi-bell-plus' : 'mdi-send-clock' }"
    :confirm-button-attrs="{ disabled: !scheduledAt }"
    @submit="(_event, onComplete) => scheduleJob(onComplete)"
  >
    <StyledDatePicker
      v-model="scheduledAt"
      :date-picker-props="{
        minDate: minScheduledAt,
        placeholder: 'Run at',
        sixWeeks: 'append',
      }"
    />
    <v-textarea v-model="text" :label="textLabel" :rules="[rules.required()]" auto-grow />
  </StyledFormDialog>
</template>
