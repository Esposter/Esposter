<script setup lang="ts">
import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { pollOptionSchema } from "#shared/models/message/poll/PollOption";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "@/services/message/poll/constants";
import { UiRules } from "@/services/ui/UiRules";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";

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
    options: options.value.map((label) => ({ id: crypto.randomUUID(), label })),
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
    is-optimistic
    :submit="createPoll"
    title="Create Poll"
  >
    <UiTextField v-model="question" is-autofocus label="Question" :rules="requiredRules" />
    <div v-for="(option, index) of options" :key="index" flex gap-2 items-end>
      <UiTextField
        :model-value="option"
        :label="`Option ${index + 1}`"
        :rules="requiredRules"
        flex-1
        @update:model-value="options = options.with(index, $event)"
      />
      <UiIconButton
        :disabled="options.length <= POLL_MIN_OPTIONS"
        label="Remove option"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="options = options.toSpliced(index, 1)"
      />
    </div>
    <UiButton :disabled="options.length >= POLL_MAX_OPTIONS" self-start @click="options = [...options, '']">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add Option
    </UiButton>
    <template #prepend-actions>
      <span text-sm text-muted>{{ options.length }}/{{ POLL_MAX_OPTIONS }} options</span>
    </template>
  </StyledFormDialog>
</template>
