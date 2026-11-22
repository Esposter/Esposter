<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiRules } from "#src/services/ui/UiRules";
import { useDataStore } from "#src/store/message/data";
import { usePollDialogStore } from "#src/store/message/input/pollDialog";
import { useRoomStore } from "#src/store/message/room/index";
import {
  MessageType,
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  pollMessageContentSchema,
  pollOptionSchema,
} from "@esposter/db-schema";
import { v7 } from "uuid";

const requiredRules = [UiRules.required()];
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const pollDialogStore = usePollDialogStore();
const { isOpen } = storeToRefs(pollDialogStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const question = ref("");
const options = ref(Array.from({ length: POLL_MIN_OPTIONS }, () => ""));
// The shared schema decides validity: a whitespace-only question or option passes the field rule and fails on submit
const isPollValid = computed(
  () =>
    pollMessageContentSchema.shape.question.safeParse(question.value).success &&
    options.value.every((label) => pollOptionSchema.shape.label.safeParse(label).success),
);
const createPoll = async () => {
  const roomId = currentRoomId.value;
  if (!roomId) return;
  const pollContent = pollMessageContentSchema.parse({
    options: options.value.map((label) => ({ id: v7(), label })),
    question: question.value,
    votes: {},
  });
  question.value = "";
  options.value = Array.from({ length: POLL_MIN_OPTIONS }, () => "");
  await createMessage({ message: JSON.stringify(pollContent), roomId, type: MessageType.Poll });
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Create Poll"
    :is-confirm-disabled="!isPollValid || undefined"
    :submit="createPoll"
    title="Create Poll"
  >
    <UiTextField v-model="question" is-autofocus label="Question" :rules="requiredRules" />
    <MessageModelMessageInputPollDialogOption
      v-for="(option, index) of options"
      :key="index"
      :index
      :is-remove-disabled="options.length <= POLL_MIN_OPTIONS || undefined"
      :model-value="option"
      @update:model-value="options = options.with(index, $event)"
      @remove="options = options.toSpliced(index, 1)"
    />
    <UiButton :disabled="options.length >= POLL_MAX_OPTIONS" self-start @click="options = [...options, '']">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add Option
    </UiButton>
    <template #prepend-actions>
      <span text-sm text-muted>{{ options.length }}/{{ POLL_MAX_OPTIONS }} options</span>
    </template>
  </StyledFormDialog>
</template>
