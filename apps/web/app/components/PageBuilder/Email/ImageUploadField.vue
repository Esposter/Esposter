<script setup lang="ts">
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

interface Props {
  resourceId: string;
}

const { resourceId } = defineProps<Props>();
// The picked image is uploaded to the email's own file assets, and its stable asset url is emitted as the image's source,
// So the email names the url and never the bytes. A failed upload alerts and emits nothing. The url goes to the node that
// Was selected when the file was picked, since the upload can land after the selection has moved on
const emit = defineEmits<{ update: [src: string, nodeId: string] }>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId } = pageBuilderCanvasStore;
const uploadFile = useUploadResourceFile(ResourceType.Email, () => resourceId);
const onPick = async (files: File[]) => {
  const [file] = files;
  if (!file) return;

  const pickedNodeId = getSelectedNodeId(resourceId);
  const uploadResult = await getResultAsync(() => uploadFile(file));
  uploadResult.match((src) => emit("update", src, pickedNodeId), createErrorAlert);
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
