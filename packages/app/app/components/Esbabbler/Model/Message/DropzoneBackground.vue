<script setup lang="ts">
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";

import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
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

    const fileSasEntities = await $trpc.message.generateUploadFileSasUrls.query({
      files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
      roomId: currentRoomId.value,
    });

    isFileLoading.value = true;
    await Promise.all(
      newFiles.map(async (file, index) => {
        const { id, sasUrl } = fileSasEntities[index];
        const uploadFileUrl = reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) });
        fileUrlMap.value.set(id, uploadFileUrl);
        files.value[files.value.length + index] = { filename: file.name, id, mimetype: file.type };
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
      <v-card-title text-xl font-bold pb-0>Upload to {{ currentRoomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
