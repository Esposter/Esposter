<script setup lang="ts">
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { WordFilterAction } from "@esposter/db-schema";
import deepEqual from "fast-deep-equal";

interface WordFilterFormData {
  action: WordFilterAction;
  timeoutDurationMs: number;
  words: string[];
}
interface WordFilterFormProps {
  filter: null | RoomFilterInMessage;
  roomId: string;
}

const { filter, roomId } = defineProps<WordFilterFormProps>();
const { $trpc } = useNuxtApp();
const actionSelectItems = Object.values(WordFilterAction).map((value) => ({ title: value, value }));
const timeoutDurationSelectItems = Object.entries(TimeoutDurationMap).map(([title, value]) => ({ title, value }));
const getWordFilterFormData = (filter: null | RoomFilterInMessage): WordFilterFormData => ({
  action: filter?.action ?? WordFilterAction.Reject,
  timeoutDurationMs: filter?.timeoutDurationMs ?? TimeoutDurationMap["5 minutes"],
  words: filter?.words ?? [],
});
const baseline = ref(getWordFilterFormData(filter));
const { cloned: formData, sync } = useCloned(baseline, { manual: true });
const isTimeout = computed(() => formData.value.action === WordFilterAction.Timeout);
const isDirty = computed(
  () =>
    !deepEqual(formData.value.words, baseline.value.words) ||
    formData.value.action !== baseline.value.action ||
    (isTimeout.value && formData.value.timeoutDurationMs !== baseline.value.timeoutDurationMs),
);
const executeMutation = useMutation();
const saveFilter = async () => {
  await executeMutation(
    () =>
      $trpc.room.filter.upsertRoomFilter.mutate({
        action: formData.value.action,
        roomId,
        timeoutDurationMs: isTimeout.value ? formData.value.timeoutDurationMs : null,
        words: formData.value.words,
      }),
    {
      applyOptimistic: () => {
        const previousBaseline = baseline.value;
        baseline.value = structuredClone(toRaw(formData.value));
        return () => {
          baseline.value = previousBaseline;
        };
      },
      onSuccess: (filter) => {
        baseline.value = getWordFilterFormData(filter);
        sync();
      },
    },
  );
};
</script>

<template>
  <div flex flex-col gap-2>
    <MessageModelRoomSettingsTypeWordFilterWordsInput v-model="formData.words" />
    <div mt-2 font-semibold>Action</div>
    <v-select v-model="formData.action" :items="actionSelectItems" density="compact" hide-details label="On match" />
    <v-select
      v-if="isTimeout"
      v-model="formData.timeoutDurationMs"
      :items="timeoutDurationSelectItems"
      density="compact"
      hide-details
      label="Timeout duration"
    />
    <span text-hint>
      Reject blocks the message. Warn and Timeout also record a moderation action against the sender.
    </span>
    <StyledButton :button-props="{ disabled: !isDirty, text: 'Save Changes', variant: 'tonal' }" @click="saveFilter" />
  </div>
</template>
