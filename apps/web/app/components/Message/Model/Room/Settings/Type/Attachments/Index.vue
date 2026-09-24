<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { MimeCategories } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
const editedMaxFileSizeBytes = ref(room.maxFileSizeBytes);
const editedAllowedMimeCategories = ref([...room.allowedMimeCategories]);
const maxFileSizeMegabytes = MAX_FILE_REQUEST_SIZE / MEGABYTE;
const rules = useVRules();
const maxFileSizeRules = computed(() => [
  rules.minValue(1),
  (value: string) =>
    value === "" ||
    Number(value) <= maxFileSizeMegabytes ||
    `You must enter a value of at most ${maxFileSizeMegabytes}`,
]);
const isDirty = computed(
  () =>
    editedMaxFileSizeBytes.value !== room.maxFileSizeBytes ||
    editedAllowedMimeCategories.value.join(",") !== room.allowedMimeCategories.join(","),
);
const save = async () => {
  if (!isDirty.value) return;

  await saveRoom({
    allowedMimeCategories: editedAllowedMimeCategories.value,
    maxFileSizeBytes: editedMaxFileSizeBytes.value,
  });
};
</script>

<!-- A handful of kinds, so each is a box of its own the reader sees at once rather than a list folded behind a
     select -->
<template>
  <div py-4 flex flex-col gap-6 ui-body>
    <UiTextField
      :hint="`In MB. Leave empty to use the platform limit of ${maxFileSizeMegabytes} MB.`"
      :model-value="editedMaxFileSizeBytes ? String(editedMaxFileSizeBytes / MEGABYTE) : ''"
      label="Maximum file size"
      :rules="maxFileSizeRules"
      :type="UiTextFieldType.Number"
      @update:model-value="editedMaxFileSizeBytes = $event ? Number($event) * MEGABYTE : 0"
      @focusout="save()"
      @keydown.enter.prevent="save()"
    />
    <MessageModelRoomSettingsField
      hint="Members can only upload the selected categories."
      title="Allowed attachment types"
    >
      <div role="group" aria-label="Allowed attachment types" flex flex-col gap-2>
        <UiCheckbox
          v-for="category of MimeCategories"
          :key="category"
          is-label-shown
          :label="category"
          :model-value="editedAllowedMimeCategories.includes(category)"
          @update:model-value="
            (isAllowed) => {
              editedAllowedMimeCategories = isAllowed
                ? MimeCategories.filter(
                    (mimeCategory) => mimeCategory === category || editedAllowedMimeCategories.includes(mimeCategory),
                  )
                : editedAllowedMimeCategories.filter((mimeCategory) => mimeCategory !== category);
              save();
            }
          "
        />
      </div>
    </MessageModelRoomSettingsField>
  </div>
</template>
