<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";

import { validateFile } from "@/services/file/validateFile";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, takeOne } from "@esposter/shared";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const { $trpc } = useNuxtApp();
const { isLoading, uploadImage } = useUploadImage(() => $trpc.user.generateProfileImageUploadUrl.mutate());
const validateFileRule = (fileValue: FileFieldValue) => {
  if (!fileValue) return true;

  for (const file of Array.isArray(fileValue) ? fileValue : [fileValue]) {
    const result = validateFile(file.size);
    if (!result.isValid) return result.message;
  }

  return true;
};
const FILE_RULES = [validateFileRule];
</script>

<template>
  <v-col flex flex-wrap gap-x-4 items-center self-center cols="6">
    <template v-if="editMode">
      <v-avatar>
        <NuxtImg v-if="modelValue" size-full object-contain :src="modelValue" :alt="modelValue" />
        <NuxtImg v-else-if="value" size-full object-contain :src="value" :alt="value" />
      </v-avatar>
      <v-file-input
        :disabled="isLoading"
        :rules="FILE_RULES"
        accept="image/*"
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        show-size
        my-2
        @update:model-value="
          async (files?) => {
            if (!files) return;

            const file = Array.isArray(files) ? takeOne(files) : files;
            if (!validateFile(file.size).isValid) return;

            await getResultAsync(() => uploadImage(file)).match((newImage) => {
              modelValue = newImage;
            }, createErrorAlert);
          }
        "
      />
    </template>
    <v-avatar v-else>
      <NuxtImg v-if="value" size-full object-contain :src="value" :alt="value" />
    </v-avatar>
  </v-col>
</template>
