<script setup lang="ts">
import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { validateFile } from "@/services/file/validateFile";
import { takeOne, withFinalizerAsync } from "@esposter/shared";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const { $trpc } = useNuxtApp();
const isLoading = ref(false);
const validateFileRule = (fileValue: FileFieldValue) => {
  if (!fileValue) return true;

  for (const file of Array.isArray(fileValue) ? fileValue : [fileValue]) {
    const result = validateFile(file.size);
    if (!result.isValid) return result.message;
  }

  return true;
};
</script>

<template>
  <v-col flex flex-wrap gap-x-4 items-center self-center cols="6">
    <template v-if="editMode">
      <v-avatar>
        <v-img v-if="modelValue" :src="modelValue" :alt="modelValue" />
        <v-img v-else-if="value" :src="value" :alt="value" />
      </v-avatar>
      <v-file-input
        :disabled="isLoading"
        :rules="[validateFileRule]"
        accept="image/*"
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        hide-details
        show-size
        my-2
        @update:model-value="
          async (files?) => {
            if (!files) return;

            const file = Array.isArray(files) ? takeOne(files) : files;
            if (!validateFile(file.size).isValid) return;

            isLoading = true;
            await withFinalizerAsync(
              async () => {
                const { publicUrl, sasUrl } = await $trpc.user.generateProfileImageUploadUrl.mutate();
                await uploadFileToSas({
                  files: [file],
                  generateUploadFileSasEntities: async () => [{ id: '', sasUrl }],
                });
                modelValue = publicUrl;
              },
              () => {
                isLoading = false;
              },
            );
          }
        "
      />
    </template>
    <v-avatar v-else>
      <v-img v-if="value" :src="value" :alt="value" />
    </v-avatar>
  </v-col>
</template>
