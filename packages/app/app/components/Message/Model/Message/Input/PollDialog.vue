<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

import { pollMessageContentSchema } from "@/models/message/poll/PollMessageContent";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

const rules = useVRules();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const pollDialogStore = usePollDialogStore();
const { isOpen } = storeToRefs(pollDialogStore);
const dataStore = useDataStore();
const { createMessage } = dataStore;
const question = ref("");
const options = ref(["", ""]);
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
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="question" :rules="[rules.required()]" label="Question" />
        </v-col>
        <v-col cols="12">
          <v-list bg-color="transparent">
            <v-list-item v-for="(option, index) of options" :key="index" :ripple="false" px-0>
              <v-text-field
                :model-value="option"
                :rules="[rules.required()]"
                :label="`Option ${index + 1}`"
                hide-details="auto"
                @update:model-value="options[index] = $event"
              />
              <template #append>
                <v-tooltip text="Remove option">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      :disabled="options.length <= 2"
                      icon="mdi-close"
                      size="small"
                      :="tooltipProps"
                      @click="options.splice(index, 1)"
                    />
                  </template>
                </v-tooltip>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12">
          <v-tooltip text="Add option">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                :disabled="options.length >= 10"
                prepend-icon="mdi-plus"
                :="tooltipProps"
                @click="options.push('')"
              >
                Add Option
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>
    <template #prepend-actions> {{ options.length }}/10 options </template>
  </StyledFormDialog>
</template>
