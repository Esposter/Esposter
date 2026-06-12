<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { sanitizeMessageHtml } from "@/services/sanitizeHtml/sanitizeMessageHtml";
import { formRules } from "@/services/vuetify/formRules";
import { useScheduledMessageJobDialogStore } from "@/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "@/store/message/room";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";
import { marked } from "marked";

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
const confirmText = computed(() => (isReminder.value ? "Set Reminder" : "Schedule Message"));
const setDefaultScheduledAt = () => {
  scheduledAt.value = dayjs().add(1, "minute").toDate();
  minScheduledAt.value = new Date(scheduledAt.value);
};

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) setDefaultScheduledAt();
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title }"
    :confirm-button-props="{ text: confirmText, prependIcon: isReminder ? 'mdi-bell-plus' : 'mdi-send-clock' }"
    :confirm-button-attrs="{ disabled: !scheduledAt }"
    @submit="
      async (_event, onComplete) => {
        await withFinalizerAsync(async () => {
          const roomId = currentRoomId;
          if (!roomId) return;

          if (isReminder)
            await $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
              roomId,
              runAt: scheduledAt,
              text: sanitizeMessageHtml(text),
            });
          else
            await $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
              message: sanitizeMessageHtml(marked.parse(text, { async: false })),
              roomId,
              runAt: scheduledAt,
            });
        }, onComplete);
      }
    "
  >
    <v-container>
      <v-row>
        <v-col cols="12">
          <StyledDatePicker
            v-model="scheduledAt"
            :date-picker-props="{
              minDate: minScheduledAt,
              placeholder: 'Run at',
              sixWeeks: 'append',
            }"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="text" :label="textLabel" :rules="[formRules.required]" auto-grow />
        </v-col>
      </v-row>
    </v-container>
  </StyledFormDialog>
</template>
