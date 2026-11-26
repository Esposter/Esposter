<script setup lang="ts">
import type { Row } from "#src/models/user/ProfileCard/Row";
import type { RowValueType } from "#src/models/user/ProfileCard/RowValueType";

import { IMAGE_UPLOAD_MIME_TYPES } from "#shared/services/file/constants";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { validateFile } from "#src/services/file/validateFile";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

interface Props {
  isEditMode: boolean;
  label: string;
  value: Row<typeof RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<typeof RowValueType.Image>["value"]>({ required: true });
defineProps<Props>();
const { $trpc } = useNuxtApp();
const { isLoading, uploadImage } = useUploadImage((file) =>
  $trpc.user.generateProfileImageUploadUrl.mutate({ mimetype: file.type, size: file.size }),
);
const fileInput = useTemplateRef("fileInput");
const fileMessage = ref("");
</script>

<template>
  <UserProfileCardField :label>
    <div flex flex-wrap gap-4 items-center>
      <UiAvatar :image="isEditMode ? modelValue : value" :name="label" />
      <template v-if="isEditMode">
        <UiHiddenFileInput
          ref="fileInput"
          :accept="IMAGE_UPLOAD_MIME_TYPES.join(',')"
          @select="async (file) => {
            // Cleared, so choosing the same file again after a refusal is a change too
            fileInput?.reset();
            if (!file) return;
          
            const fileValidation = validateFile(file.size);
            fileMessage = fileValidation.isValid ? '' : fileValidation.message;
            if (!fileValidation.isValid) return;
          
            await getResultAsync(() => uploadImage(file)).match((newImage) => {
              modelValue = newImage;
            }, createErrorAlert);
          }"
        />
        <UiButton :is-pending="isLoading" @click="fileInput?.open()">
          <UiIcon v-if="!isLoading" :meaning="UiIconMeaning.Upload" />
          Upload image
        </UiButton>
        <span v-if="fileMessage" role="alert" text-error>{{ fileMessage }}</span>
      </template>
    </div>
  </UserProfileCardField>
</template>
