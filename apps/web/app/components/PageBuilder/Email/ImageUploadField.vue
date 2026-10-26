<script setup lang="ts">
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

interface Props {
  resourceId: string;
}

const { resourceId } = defineProps<Props>();
// The picked image is uploaded to the email's own file assets, and its stable asset url is emitted as the image's source,
// So the email names the url and never the bytes. A failed upload alerts and emits nothing
const emit = defineEmits<{ update: [src: string] }>();
const uploadFile = useUploadResourceFile(ResourceType.Email, () => resourceId);
const onPick = async (files: File[]) => {
  const [file] = files;
  if (!file) return;

  const uploadResult = await getResultAsync(() => uploadFile(file));
  uploadResult.match((src) => emit("update", src), createErrorAlert);
};
</script>

<template>
  <UiFileField
    accept="image/*"
    label="Upload image"
    :model-value="[]"
    @update:model-value="(newModelValue) => onPick(newModelValue)"
  />
</template>
