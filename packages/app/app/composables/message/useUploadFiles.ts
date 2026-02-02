import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { validateFile } from "@/services/file/validateFile";
import { useAlertStore } from "@/store/alert";
import { useRoomStore } from "@/store/message/room";
import { useUploadFileStore } from "@/store/message/uploadFile";
import { FILE_MAX_LENGTH } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

export const useUploadFiles = () => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const uploadFileStore = useUploadFileStore();
  const { files, fileUrlMap, isFileLoading } = storeToRefs(uploadFileStore);
  return async (newFiles: File[] | null) => {
    if (!currentRoomId.value || !newFiles) return;
    else if (files.value.length + newFiles.length > FILE_MAX_LENGTH) {
      createAlert(`You can only upload ${FILE_MAX_LENGTH} files at a time!`, "error");
      return;
    }

    const fileSasEntities = await $trpc.message.generateUploadFileSasEntities.query({
      files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
      roomId: currentRoomId.value,
    });

    isFileLoading.value = true;
    // Populate the file metadata first before uploading the blocks so that vue can render them properly in the UI
    for (let i = 0; i < newFiles.length; i++) {
      const file = takeOne(newFiles, i);
      const { id } = takeOne(fileSasEntities, i);
      files.value.push({ filename: file.name, id, mimetype: file.type, size: file.size });
    }

    await Promise.all(
      newFiles
        .filter(({ size }) => validateFile(size))
        .map(async (file, index) => {
          const { id, sasUrl } = takeOne(fileSasEntities, index);
          const uploadFileUrl = reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) });
          fileUrlMap.value.set(id, uploadFileUrl);
          await uploadBlocks(file, sasUrl, (progress) => {
            uploadFileUrl.progress = progress;
          });
        }),
    );
    isFileLoading.value = false;
  };
};
