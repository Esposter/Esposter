<script setup lang="ts">
import type { WordFilterFormData } from "@/models/message/moderation/WordFilterFormData";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { WordFilterAction, WordFilterActions } from "@esposter/db-schema";
import { toRawDeep } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

interface Props {
  filter?: RoomFilterInMessage;
  roomId: string;
}

const { filter, roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const actionItems = WordFilterActions.map<UiMenuItem<WordFilterAction>>((value) => ({ title: value, value }));
// A select holds a string, so each duration carries its milliseconds as one and is read back through the list
const timeoutDurationItems = TimeoutDurationSelectItems.map<UiSelectItem<string>>(({ title, value }) => ({
  meaning: UiIconMeaning.Timer,
  title,
  value: String(value),
}));
const getWordFilterFormData = (roomFilter: RoomFilterInMessage | undefined): WordFilterFormData => ({
  action: roomFilter?.action ?? WordFilterAction.Reject,
  timeoutDurationMs: roomFilter?.timeoutDurationMs ?? TimeoutDurationMap["5 minutes"],
  words: roomFilter?.words ?? [],
});
const initialFormData = ref(getWordFilterFormData(filter));
const { cloned: editedFormData, sync } = useCloned(initialFormData, { manual: true });
const isTimeout = computed(() => editedFormData.value.action === WordFilterAction.Timeout);
const selectedTimeoutDuration = computed({
  get: () => String(editedFormData.value.timeoutDurationMs),
  set: (newValue) => {
    const item = TimeoutDurationSelectItems.find(({ value }) => String(value) === newValue);
    if (item) editedFormData.value.timeoutDurationMs = item.value;
  },
});
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
  <div flex flex-col gap-6>
    <MessageModelRoomSettingsTypeWordFilterWordsInput v-model="editedFormData.words" />
    <MessageModelRoomSettingsField
      hint="Reject blocks the message. Warn and Timeout also record a moderation action against the sender."
      title="On match"
    >
      <div flex gap-2 items-center>
        <UiToggleGroup v-model="editedFormData.action" :items="actionItems" label="On match" />
        <UiSelect
          v-if="isTimeout"
          v-model="selectedTimeoutDuration"
          :items="timeoutDurationItems"
          label="Timeout duration"
          flex-1
          min-w-0
        />
      </div>
    </MessageModelRoomSettingsField>
    <MessageModelRoomSettingsUnsavedChangesBar v-if="isDirty" @reset="sync()" @save="saveFilter()" />
  </div>
</template>
