<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "@/services/message/poll/constants";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

const rules = useVRules();
const requiredRules = computed(() => [rules.required()]);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const pollDialogStore = usePollDialogStore();
const { isOpen } = storeToRefs(pollDialogStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const question = ref("");
const options = ref(Array.from<string>({ length: POLL_MIN_OPTIONS }).fill(""));
const submit = async (_event: SubmitEventPromise, onComplete: () => void) =>
  await withFinalizerAsync(async () => {
    if (!currentRoomId.value) return;
    const pollContent = pollMessageContentSchema.parse({
      options: options.value.map((label) => ({ id: crypto.randomUUID(), label })),
      question: question.value,
      votes: {},
    });
    await createMessage({ message: JSON.stringify(pollContent), roomId: currentRoomId.value, type: MessageType.Poll });
  }, onComplete);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Create Poll' }"
    :confirm-button-props="{ text: 'Create Poll', prependIcon: 'mdi-poll' }"
    @submit="submit"
  >
    <v-text-field v-model="question" :rules="requiredRules" label="Question" />
    <v-list bg-color="transparent">
      <v-list-item v-for="(option, index) of options" :key="index" :ripple="false" px-0>
        <v-text-field
          :model-value="option"
          :rules="requiredRules"
          :label="`Option ${index + 1}`"
          @update:model-value="options[index] = $event"
        />
        <template #append>
          <StyledTooltipIconButton
            :button-props="{ disabled: options.length <= POLL_MIN_OPTIONS, size: 'small' }"
            icon="mdi-close"
            text="Remove option"
            @click="options.splice(index, 1)"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-tooltip text="Add option">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          :disabled="options.length >= POLL_MAX_OPTIONS"
          prepend-icon="mdi-plus"
          :="tooltipProps"
          @click="options.push('')"
        >
          Add Option
        </v-btn>
      </template>
    </v-tooltip>
    <template #prepend-actions> {{ options.length }}/{{ POLL_MAX_OPTIONS }} options </template>
  </StyledFormDialog>
</template>
