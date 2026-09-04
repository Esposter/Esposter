<script setup lang="ts">
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { WordFilterAction } from "@esposter/db-schema";
import { toRawDeep } from "@esposter/shared";
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
const getWordFilterFormData = (roomFilter: null | RoomFilterInMessage): WordFilterFormData => ({
  action: roomFilter?.action ?? WordFilterAction.Reject,
  timeoutDurationMs: roomFilter?.timeoutDurationMs ?? TimeoutDurationMap["5 minutes"],
  words: roomFilter?.words ?? [],
});
const initialFormData = ref(getWordFilterFormData(filter));
const { cloned: editedFormData, sync } = useCloned(initialFormData, { manual: true });
const isTimeout = computed(() => editedFormData.value.action === WordFilterAction.Timeout);
const isDirty = computed(
  () =>
    !deepEqual(editedFormData.value.words, initialFormData.value.words) ||
    editedFormData.value.action !== initialFormData.value.action ||
    (isTimeout.value && editedFormData.value.timeoutDurationMs !== initialFormData.value.timeoutDurationMs),
);
const { executeMutation } = useMutation();
const saveFilter = async () => {
  await executeMutation(
    () =>
      $trpc.room.filter.upsertRoomFilter.mutate({
        action: editedFormData.value.action,
        roomId,
        timeoutDurationMs: isTimeout.value ? editedFormData.value.timeoutDurationMs : null,
        words: editedFormData.value.words,
      }),
    {
      applyOptimistic: () => {
        const previousInitialFormData = initialFormData.value;
        initialFormData.value = structuredClone(toRawDeep(editedFormData.value));
        return () => {
          initialFormData.value = previousInitialFormData;
        };
      },
      key: roomId,
      onSuccess: (updatedFilter) => {
        initialFormData.value = getWordFilterFormData(updatedFilter);
        sync();
      },
    },
  );
};
</script>

<template>
  <div flex flex-col gap-2>
    <MessageModelRoomSettingsTypeWordFilterWordsInput v-model="editedFormData.words" />
    <div font-semibold mt-2>Action</div>
    <v-select v-model="editedFormData.action" :items="actionSelectItems" density="compact" label="On match" />
    <v-select
      v-if="isTimeout"
      v-model="editedFormData.timeoutDurationMs"
      :items="TimeoutDurationSelectItems"
      density="compact"
      label="Timeout duration"
    />
    <span text-hint>
      Reject blocks the message. Warn and Timeout also record a moderation action against the sender.
    </span>
    <StyledButton :button-props="{ disabled: !isDirty, text: 'Save Changes', variant: 'tonal' }" @click="saveFilter" />
  </div>
</template>
