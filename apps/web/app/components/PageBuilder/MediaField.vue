<script setup lang="ts">
import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { WEBPAGE_VIDEO_MIME_TYPES } from "#shared/services/pageBuilder/constants";
import { NOTE_IMAGE_MIME_TYPES } from "#shared/services/resource/note/constants";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { MimeCategory, ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

interface Props {
  // The kind of file the field takes: an image or a video
  category: MimeCategory;
  resourceId: string;
}
const { category, resourceId } = defineProps<Props>();
// The picked file's address goes to the node that was selected when the file was picked, since an upload can land after
// The selection has moved on. A file the field does not take, or one over the upload limit, is refused before it is sent
const emit = defineEmits<{ update: [src: string, nodeId: string] }>();
const acceptedMimetypes = category === MimeCategory.Video ? WEBPAGE_VIDEO_MIME_TYPES : NOTE_IMAGE_MIME_TYPES;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId } = pageBuilderCanvasStore;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const uploadFile = useUploadResourceFile(ResourceType.Webpage, () => resourceId);
const onPick = async (files: File[]) => {
  const [file] = files;
  if (!file) return;
  if (!acceptedMimetypes.includes(file.type)) {
    createAlert(`Choose a file of one of these types: ${acceptedMimetypes.join(", ")}`, "error");
    return;
  }
  if (file.size > MAX_FILE_REQUEST_SIZE) {
    createAlert(`Files over ${MAX_FILE_REQUEST_SIZE / MEGABYTE} MB cannot be uploaded`, "error");
    return;
  }

  const pickedNodeId = getSelectedNodeId(resourceId);
  const uploadResult = await getResultAsync(() => uploadFile(file));
  uploadResult.match((src) => emit("update", src, pickedNodeId), createErrorAlert);
};
</script>

<template>
  <div flex flex-col gap-2>
    <UiFileField
      :accept="acceptedMimetypes.join(',')"
      :label="`Upload ${category.toLowerCase()}`"
      :model-value="[]"
      @update:model-value="(files) => onPick(files)"
    />
    <PageBuilderFilePicker
      :category
      :resource-id
      :type="ResourceType.Webpage"
      @update="(src) => emit('update', src, getSelectedNodeId(resourceId))"
    />
  </div>
</template>
