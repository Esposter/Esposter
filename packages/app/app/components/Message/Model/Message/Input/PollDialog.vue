<script setup lang="ts">
import type { PollMessageContent } from "@/models/message/poll/PollMessageContent";
import type { SubmitEventPromise } from "vuetify";

import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/pollDialog";
import { MessageType } from "@esposter/db-schema";

const pollDialogStore = usePollDialogStore();
const { isOpen, roomId } = storeToRefs(pollDialogStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const question = ref("");
const options = ref(["", ""]);

const updateOption = (index: number, value: string) => {
  options.value = options.value.map((option, i) => (i === index ? value : option));
};
const addOption = () => {
  if (options.value.length < 10) options.value = [...options.value, ""];
};
const removeOption = (index: number) => {
  if (options.value.length > 2) options.value = options.value.filter((_, i) => i !== index);
};

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) return;
  question.value = "";
  options.value = ["", ""];
});

const onSubmit = async (_event: SubmitEventPromise, onComplete: () => void) => {
  if (!roomId.value) return;
  const pollContent: PollMessageContent = {
    options: options.value.map((label) => ({ id: crypto.randomUUID(), label: label.trim() })),
    question: question.value.trim(),
    votes: {},
  };
  await createMessage({
    message: JSON.stringify(pollContent),
    roomId: roomId.value,
    type: MessageType.Poll,
  });
  onComplete();
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Create Poll' }"
    :confirm-button-props="{ text: 'Create Poll', prependIcon: 'mdi-poll' }"
    @submit="onSubmit"
  >
    <v-text-field
      v-model="question"
      :rules="[(value: string) => Boolean(value.trim()) || 'Question is required']"
      label="Question"
      required
    />
    <div flex flex-col gap-2 my-2>
      <div v-for="(option, index) of options" :key="index" flex items-center gap-2>
        <v-text-field
          :model-value="option"
          :rules="[(value: string) => Boolean(value.trim()) || 'Option cannot be empty']"
          :label="`Option ${index + 1}`"
          hide-details="auto"
          required
          @update:model-value="updateOption(index, $event)"
        />
        <v-btn
          :disabled="options.length <= 2"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="removeOption(index)"
        />
      </div>
    </div>
    <v-btn :disabled="options.length >= 10" prepend-icon="mdi-plus" variant="text" @click="addOption">
      Add Option
    </v-btn>
    <p v-if="options.length >= 10" text-sm text-gray mt-1>Maximum 10 options</p>
    <template #prepend-actions>
      <span text-sm text-gray>{{ options.length }}/10 options</span>
    </template>
  </StyledFormDialog>
</template>
