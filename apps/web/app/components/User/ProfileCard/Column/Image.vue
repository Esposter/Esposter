<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { validateFile } from "@/services/file/validateFile";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

interface Props {
  editMode: boolean;
  label: string;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, label, value } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { isLoading, uploadImage } = useUploadImage(() => $trpc.user.generateProfileImageUploadUrl.mutate());
const fileInput = useTemplateRef("fileInput");
const fileMessage = ref("");
</script>

<template>
  <UserProfileCardField :label>
    <div flex flex-wrap gap-4 items-center>
      <UiAvatar :image="(editMode ? modelValue : value) ?? ''" :name="label" />
      <template v-if="editMode">
        <!-- The browser's own file input, hidden behind the library's button, so choosing a file is its dialog -->
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -- hidden, and only ever opened by the labelled button beside it -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="
            async () => {
              if (!fileInput) return;
              const file = fileInput.files?.[0];
              // Cleared, so choosing the same file again after a refusal is a change too
              fileInput.value = '';
              if (!file) return;

              const fileValidation = validateFile(file.size);
              fileMessage = fileValidation.isValid ? '' : fileValidation.message;
              if (!fileValidation.isValid) return;

              await getResultAsync(() => uploadImage(file)).match((newImage) => {
                modelValue = newImage;
              }, createErrorAlert);
            }
          "
        />
        <UiButton :disabled="isLoading" @click="fileInput?.click()">
          <UiSpinner v-if="isLoading" />
          <UiIcon v-else :meaning="UiIconMeaning.Upload" />
          Upload image
        </UiButton>
        <span v-if="fileMessage" role="alert" text-error>{{ fileMessage }}</span>
      </template>
    </div>
  </UserProfileCardField>
</template>
