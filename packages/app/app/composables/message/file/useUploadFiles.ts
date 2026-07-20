import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { FileSasEntity } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { generateImageThumbnail } from "@/services/file/generateImageThumbnail";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { useAlertStore } from "@/store/alert";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { FILE_MAX_LENGTH, getMimeCategory } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

export const useUploadFiles = () => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const roomStore = useRoomStore();
  const { currentRoom, currentRoomId } = storeToRefs(roomStore);
  const uploadFileStore = useUploadFileStore();
  const { files, fileUrlMap, isFileLoading } = storeToRefs(uploadFileStore);
  const validateFile = useValidateFile();
  return async (newFiles: File[] | null) => {
    if (!currentRoomId.value || !newFiles) return;
    else if (files.value.length + newFiles.length > FILE_MAX_LENGTH) {
      createAlert(`You can only upload ${FILE_MAX_LENGTH} files at a time!`, "error");
      return;
    }

    const room = currentRoom.value;
    // Mirror the server chokepoint's platform-cap clamp so a room limit above the cap fails here, not at the SAS query.
    const maxFileSizeBytes = Math.min(room?.maxFileSizeBytes ?? MAX_FILE_REQUEST_SIZE, MAX_FILE_REQUEST_SIZE);
    // Validate before the SAS query and before rendering metadata so a rejected file is surfaced loudly.
    for (const file of newFiles)
      if (!validateFile(file.size, maxFileSizeBytes)) return;
      else if (room && !room.allowedMimeCategories.includes(getMimeCategory(file.type))) {
        createAlert(
          `This room only allows ${room.allowedMimeCategories.join(", ").toLowerCase()} attachments!`,
          "error",
        );
        return;
      }

    const roomId = currentRoomId.value;
    isFileLoading.value = true;
    // Downscale image thumbnails while the originals upload so both land in one pass.
    const thumbnailsPromise = Promise.all(newFiles.map((file) => generateImageThumbnail(file)));
    // Seed each file's metadata + object url once the write targets exist so Vue renders progress during upload.
    const seedUploadFiles = (fileSasEntities: FileSasEntity[]) => {
      for (const [index, { id }] of fileSasEntities.entries()) {
        const file = takeOne(newFiles, index);
        files.value.push({ filename: file.name, id, mimetype: file.type, size: file.size });
        fileUrlMap.value.set(id, reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) }));
      }
    };
    const fileSasEntities = await uploadFileToSas({
      files: newFiles,
      generateUploadFileSasEntities: (uploadFiles) =>
        $trpc.message.generateUploadFileSasEntities.query({ files: uploadFiles, roomId }),
      onUploadProgress: ({ id }, progress) => {
        const uploadFileUrl = fileUrlMap.value.get(id);
        if (uploadFileUrl) uploadFileUrl.progress = progress;
      },
      onUploadStart: seedUploadFiles,
    });
    const thumbnails = await thumbnailsPromise;
    await Promise.all(
      fileSasEntities.map((fileSasEntity, index) => {
        const thumbnail = takeOne(thumbnails, index);
        return fileSasEntity.thumbnailSasUrl && thumbnail
          ? uploadBlocks(thumbnail, fileSasEntity.thumbnailSasUrl)
          : Promise.resolve();
      }),
    );
    isFileLoading.value = false;
  };
};
