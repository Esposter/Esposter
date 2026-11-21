<script setup lang="ts">
import type { WordFilterFormData } from "#src/models/message/moderation/WordFilterFormData";
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { mergeWordFilterFormData } from "#src/services/message/moderation/mergeWordFilterFormData";
import { TimeoutDurationMap } from "#src/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "#src/services/message/moderation/TimeoutDurationSelectItems";
import { getNumberSelectItems } from "#src/services/message/shared/getNumberSelectItems";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { WordFilterAction, WordFilterActions } from "@esposter/db-schema";
import { checkIsDeepEqual, toRawDeep, withFinalizerAsync } from "@esposter/shared";

interface Props {
  filter?: RoomFilterInMessage | undefined;
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
const overlayStore = useOverlayStore();
const { writeAwaited } = overlayStore;
// One save at a time: each one merges against the baseline the save before it answers, so a second one sent meanwhile
// Would merge against a list the first has yet to write
const isSavePending = ref(false);
// The bar stays until the room keeps the filter, so a refused save leaves the edit in place to send again
const saveFilter = async () => {
  if (isSavePending.value) return;

  // The edit as it stood when the save was issued, and the filter it was made against
  const issuedFormData = structuredClone(toRawDeep(editedFormData.value));
  const baseFormData = initialFormData.value;
  isSavePending.value = true;
  await withFinalizerAsync(
    () =>
      writeAwaited(
        async () => {
          // Read when the write is sent, since another moderator may have changed the words since this form read them.
          // The write keeps those changes and applies only the words and fields the reader changed
          const currentFilter = await $trpc.room.filter.readRoomFilter.query({ roomId });
          const {
            action,
            timeoutDurationMs: mergedTimeoutDurationMs,
            words,
          } = mergeWordFilterFormData(baseFormData, issuedFormData, getWordFilterFormData(currentFilter));
          const savedFilter = await $trpc.room.filter.upsertRoomFilter.mutate({
            action,
            roomId,
            ...(action === WordFilterAction.Timeout && { timeoutDurationMs: mergedTimeoutDurationMs }),
            words,
          });
          // The saved filter is the server's, and it may hold other moderators' words the write merged in, so it becomes
          // The baseline once it answers
          initialFormData.value = getWordFilterFormData(savedFilter);
          sync();
          return [];
        },
        { onError: createErrorAlert },
      ),
    () => {
      isSavePending.value = false;
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
