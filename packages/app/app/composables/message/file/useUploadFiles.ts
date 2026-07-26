import type { MessageFileSasEntity } from "#shared/models/message/file/MessageFileSasEntity";
import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { generateImageThumbnail } from "@/services/file/generateImageThumbnail";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { useAlertStore } from "@/store/alert";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { FILE_MAX_LENGTH, getMimeCategory } from "@esposter/db-schema";
import { getResultAsync, noop, takeOne, withFinalizerAsync } from "@esposter/shared";

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
    // Validate before the SAS query and before rendering metadata so a rejected file is surfaced loudly. One
    // Rejected file rejects the whole drop, naming it, rather than silently uploading the rest of the selection.
    for (const file of newFiles)
      if (!validateFile(file, maxFileSizeBytes)) return;
      else if (room && !room.allowedMimeCategories.includes(getMimeCategory(file.type))) {
        createAlert(
          `${file.name}: this room only allows ${room.allowedMimeCategories.join(", ").toLowerCase()} attachments!`,
          "error",
        );
        return;
      }

    const roomId = currentRoomId.value;
    isFileLoading.value = true;
    // Downscale image thumbnails while the originals upload so both land in one pass.
    const thumbnailsPromise = Promise.all(newFiles.map((file) => generateImageThumbnail(file)));
    // Seed each file's metadata + object url once the write targets exist so Vue renders progress during upload.
    const seedUploadFiles = (fileSasEntities: MessageFileSasEntity[]) => {
      for (const [index, { id }] of fileSasEntities.entries()) {
        const file = takeOne(newFiles, index);
        files.value.push({ filename: file.name, id, mimetype: file.type, size: file.size });
        fileUrlMap.value.set(id, reactive<UploadFileUrl>({ progress: 0, url: URL.createObjectURL(file) }));
      }
    };
    // A failed upload takes its seeded metadata and object urls back out — the composer renders from those,
    // And the send button gates on isFileLoading, so leaving either behind strands the room's whole composer.
    // Whatever already reached blob storage is dropped with it: the composer is the only thing that knows
    // These ids, so a blob the user can no longer attach is unreferenced the moment its row leaves the list.
    const revertUploadFiles = async (fileSasEntities: MessageFileSasEntity[]) => {
      for (const { id } of fileSasEntities) {
        const uploadFileUrl = fileUrlMap.value.get(id);
        if (uploadFileUrl) URL.revokeObjectURL(uploadFileUrl.url);
        fileUrlMap.value.delete(id);
      }

      // The grant minted with each write target is what authorizes the delete — the server has no entity to
      // Check an unreferenced upload's ownership against, so a file whose token was lost stays orphaned
      const tokenMap = new Map(fileSasEntities.map(({ id, token }) => [id, token]));
      const revertedFiles = files.value.filter(({ id }) => tokenMap.has(id));
      files.value = files.value.filter(({ id }) => !tokenMap.has(id));
      const deletedFiles = revertedFiles.flatMap(({ filename, id }) => {
        const token = tokenMap.get(id);
        return token ? [{ filename, id, token }] : [];
      });
      if (deletedFiles.length === 0) return;
      // Best-effort: the composer is already consistent without it, and a failure here costs storage, not
      // Correctness — surfacing a second alert over the one the user is reading would only obscure it
      await getResultAsync(() => $trpc.message.deleteUploadFiles.mutate({ files: deletedFiles, roomId })).match(
        noop,
        console.error,
      );
    };
    let seededFileSasEntities: MessageFileSasEntity[] = [];
    await withFinalizerAsync(
      () =>
        getResultAsync(async () => {
          const fileSasEntities = await uploadFileToSas({
            files: newFiles,
            generateUploadFileSasEntities: (uploadFiles) =>
              $trpc.message.generateUploadFileSasEntities.query({ files: uploadFiles, roomId }),
            onUploadProgress: ({ id }, progress) => {
              const uploadFileUrl = fileUrlMap.value.get(id);
              if (uploadFileUrl) uploadFileUrl.progress = progress;
            },
            onUploadStart: (newFileSasEntities) => {
              seededFileSasEntities = newFileSasEntities;
              seedUploadFiles(newFileSasEntities);
            },
          });
          // Thumbnails are decorative and best-effort: the renderer falls back to the original whenever the
          // Thumbnail blob is missing, so a failed downscale or a failed thumbnail PUT costs a bigger image,
          // Never an attachment. Reverting here instead would throw away originals that uploaded perfectly
          await getResultAsync(async () => {
            const thumbnails = await thumbnailsPromise;
            await Promise.all(
              fileSasEntities.map((fileSasEntity, index) => {
                const thumbnail = takeOne(thumbnails, index);
                return fileSasEntity.thumbnailSasUrl && thumbnail
                  ? uploadBlocks(thumbnail, fileSasEntity.thumbnailSasUrl)
                  : Promise.resolve();
              }),
            );
          }).match(noop, console.error);
        }).match(noop, async (error) => {
          await revertUploadFiles(seededFileSasEntities);
          createAlert(error.message, "error");
        }),
      () => {
        isFileLoading.value = false;
      },
    );
  };
};
