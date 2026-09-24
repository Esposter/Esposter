<script setup lang="ts">
import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const options = ref(Array.from({ length: POLL_MIN_OPTIONS }, () => ""));
const isValid = ref(true);
const isCreating = ref(false);
const createPoll = async () => {
  const roomId = currentRoomId.value;
  if (!roomId) return;
  const pollContent = pollMessageContentSchema.parse({
    options: options.value.map((label) => ({ id: crypto.randomUUID(), label })),
    question: question.value,
    votes: {},
  });
  await createMessage({ message: JSON.stringify(pollContent), roomId, type: MessageType.Poll });
};
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Create Poll" w="[min(32rem,90vw)]">
    <UiForm
      v-model:is-valid="isValid"
      flex
      flex-col
      min-h-0
      @submit="
        async () => {
          isCreating = true;
          await withFinalizerAsync(createPoll, () => {
            isCreating = false;
            isOpen = false;
          });
        }
      "
    >
      <div p-3 flex flex-col gap-3 min-h-0 of-y-auto>
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
      </div>
      <footer p-3 flex gap-2 items-center>
        <span text-sm text-muted flex-1>{{ options.length }}/{{ POLL_MAX_OPTIONS }} options</span>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid || isCreating" type="submit" :variant="UiButtonVariant.Accent">
          <UiSpinner v-if="isCreating" />
          Create Poll
        </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
