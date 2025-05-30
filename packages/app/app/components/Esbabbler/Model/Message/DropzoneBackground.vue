<script setup lang="ts">
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";

import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { validateFile } from "@/services/file/validateFile";
import { useRoomStore } from "@/store/esbabbler/room";
import { useUploadFileStore } from "@/store/esbabbler/uploadFile";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
const uploadFileStore = useUploadFileStore();
const { files, fileUrlMap, isFileLoading } = storeToRefs(uploadFileStore);
const { isOverDropZone } = useDropZone(
  document,
  getSynchronizedFunction(async (newFiles) => {
    if (!currentRoomId.value || !newFiles) return;
    else if (files.value.length + newFiles.length > MAX_FILE_LIMIT) {
      useToast(`You can only upload ${MAX_FILE_LIMIT} files at a time!`, { cardProps: { color: "error" } });
      return;
    }

    const fileSasEntities = await $trpc.message.generateUploadFileSasEntities.query({
      files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
      roomId: currentRoomId.value,
    });

    isFileLoading.value = true;
    // Populate the file metadata first before uploading the blocks so that vue can render them properly in the UI
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const { id } = fileSasEntities[i];
      files.value.push({ filename: file.name, id, mimetype: file.type, size: file.size });
    }

    await Promise.all(
      newFiles
        .filter(({ size }) => validateFile(size))
        .map(async (file, index) => {
          const { id, sasUrl } = fileSasEntities[index];
          const uploadFileUrl = reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) });
          fileUrlMap.value.set(id, uploadFileUrl);
          await uploadBlocks(file, sasUrl, (progress) => {
            uploadFileUrl.progress = progress;
          });
        }),
    );
    isFileLoading.value = false;
  }),
);
</script>

<template>
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard text-center p-8>
      <v-card-title font-bold text-xl pb-0>Upload to {{ currentRoomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
