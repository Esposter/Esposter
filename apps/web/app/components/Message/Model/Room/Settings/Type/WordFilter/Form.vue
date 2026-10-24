<script setup lang="ts">
import type { WordFilterFormData } from "@/models/message/moderation/WordFilterFormData";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { getNumberSelectItems } from "@/services/message/shared/getNumberSelectItems";
import { WordFilterAction, WordFilterActions } from "@esposter/db-schema";
import { checkIsDeepEqual, toRawDeep } from "@esposter/shared";

interface Props {
  filter?: RoomFilterInMessage;
  roomId: string;
}

const { filter, roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const actionItems = WordFilterActions.map<UiMenuItem<WordFilterAction>>((value) => ({ title: value, value }));
const timeoutDurationItems = getNumberSelectItems(TimeoutDurationSelectItems, UiIconMeaning.Timer);
const getWordFilterFormData = (roomFilter: RoomFilterInMessage | undefined): WordFilterFormData => ({
  action: roomFilter?.action ?? WordFilterAction.Reject,
  timeoutDurationMs: roomFilter?.timeoutDurationMs ?? TimeoutDurationMap["5 minutes"],
  words: roomFilter?.words ?? [],
});
const initialFormData = ref(getWordFilterFormData(filter));
const { cloned: editedFormData, sync } = useCloned(initialFormData, { manual: true });
const isTimeout = computed(() => editedFormData.value.action === WordFilterAction.Timeout);
// A computed rather than a toRef on the snapshot, since sync() replaces the cloned object
const timeoutDurationMs = computed({
  get: () => editedFormData.value.timeoutDurationMs,
  set: (newValue) => {
    editedFormData.value.timeoutDurationMs = newValue;
  },
});
const selectedTimeoutDuration = useNumberSelect(timeoutDurationMs, TimeoutDurationSelectItems);
const isDirty = computed(
  () =>
    !checkIsDeepEqual(editedFormData.value.words, initialFormData.value.words) ||
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
        ...(isTimeout.value && { timeoutDurationMs: editedFormData.value.timeoutDurationMs }),
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
