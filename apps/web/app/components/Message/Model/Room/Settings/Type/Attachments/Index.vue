<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { UiRules } from "#src/services/ui/UiRules";
import { MimeCategories } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
const {
  draft: editedMaxFileSizeBytes,
  isDirty: isMaxFileSizeBytesDirty,
  settle: settleMaxFileSizeBytes,
} = useStoredDraft(() => room.maxFileSizeBytes);
const {
  draft: editedAllowedMimeCategories,
  isDirty: isAllowedMimeCategoriesDirty,
  settle: settleAllowedMimeCategories,
} = useStoredDraft(() => room.allowedMimeCategories);
const maxFileSizeMegabytes = MAX_FILE_REQUEST_SIZE / MEGABYTE;
const maxFileSizeRules = [UiRules.minValue(1), UiRules.maxValue(maxFileSizeMegabytes)];
// The text the field shows, which its rules judge, so a size the field refuses is judged on what the reader sees
const maxFileSizeText = computed(() =>
  editedMaxFileSizeBytes.value ? String(editedMaxFileSizeBytes.value / MEGABYTE) : "",
);
const isMaxFileSizeValid = computed(() => maxFileSizeRules.every((rule) => rule(maxFileSizeText.value) === true));
const save = () => {
  const isMaxFileSizeBytesSavable = isMaxFileSizeBytesDirty.value && isMaxFileSizeValid.value;
  if (!isMaxFileSizeBytesSavable && !isAllowedMimeCategoriesDirty.value) return;
  // The fields this session edited and no others, so one another client changed since the panel opened is not written
  // Back with the value this panel was opened on. A size the field refuses stays in the draft under its message
  saveRoom({
    ...(isAllowedMimeCategoriesDirty.value && { allowedMimeCategories: editedAllowedMimeCategories.value }),
    ...(isMaxFileSizeBytesSavable && { maxFileSizeBytes: editedMaxFileSizeBytes.value }),
  });
  settleMaxFileSizeBytes();
  settleAllowedMimeCategories();
};
</script>

<!-- A handful of kinds, so each is a box of its own the reader sees at once rather than a list folded behind a
     select -->
<template>
  <div flex flex-col gap-6>
    <UiTextField
      :hint="`In MB. Leave empty to use the platform limit of ${maxFileSizeMegabytes} MB.`"
      :model-value="maxFileSizeText"
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
          is-label-visible
          :label="category"
          :model-value="editedAllowedMimeCategories.includes(category)"
          @update:model-value="
            (newModelValue) => {
              editedAllowedMimeCategories = newModelValue
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
