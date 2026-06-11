<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

import { dayjs } from "#shared/services/dayjs";
import { sanitizeMessageHtml } from "@/services/sanitizeHtml/sanitizeMessageHtml";
import { formRules } from "@/services/vuetify/formRules";
import { useScheduledMessageJobDialogStore } from "@/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "@/store/message/room";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { marked } from "marked";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
const { isOpen, type } = storeToRefs(scheduledMessageJobDialogStore);
const scheduledAt = ref(dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm"));
const text = ref("");
const minScheduledAt = computed(() => dayjs().add(1, "minute").format("YYYY-MM-DDTHH:mm"));
const isReminder = computed(() => type.value === ScheduledMessageJobType.Reminder);
const title = computed(() => (isReminder.value ? "Set Reminder" : "Schedule Message"));
const textLabel = computed(() => (isReminder.value ? "Reminder" : "Message"));
const confirmText = computed(() => (isReminder.value ? "Set Reminder" : "Schedule Message"));
const submit = async (_event: SubmitEventPromise, onComplete: () => void) => {
  const roomId = currentRoomId.value;
  if (!roomId) {
    onComplete();
    return;
  }

  if (isReminder.value)
    await $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
      roomId,
      runAt: dayjs(scheduledAt.value).toDate(),
      text: text.value,
    });
  else
    await $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
      message: sanitizeMessageHtml(marked.parse(text.value, { async: false })),
      roomId,
      runAt: dayjs(scheduledAt.value).toDate(),
    });

  text.value = "";
  scheduledAt.value = dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm");
  onComplete();
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title }"
    :confirm-button-props="{ text: confirmText, prependIcon: isReminder ? 'mdi-bell-plus' : 'mdi-send-clock' }"
    @submit="submit"
  >
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="scheduledAt"
            label="Run at"
            :min="minScheduledAt"
            :rules="[formRules.required]"
            type="datetime-local"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="text" :label="textLabel" :rules="[formRules.required]" auto-grow />
        </v-col>
      </v-row>
    </v-container>
  </StyledFormDialog>
</template>
