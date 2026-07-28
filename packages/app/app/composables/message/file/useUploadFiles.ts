import type { MessageFileSasEntity } from "#shared/models/message/file/MessageFileSasEntity";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { generateImageThumbnail } from "@/services/file/generateImageThumbnail";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { getIsAlertedByErrorLink } from "@/services/trpc/errorLink";
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
  const {
    discardUploadFiles,
    storeUploadEnd,
    storeUploadFileProgress,
    storeUploadFiles,
    storeUploadFileThumbnails,
    storeUploadStart,
  } = uploadFileStore;
  const { files } = storeToRefs(uploadFileStore);
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
    storeUploadStart(roomId);
    // Downscale image thumbnails while the originals upload so both land in one pass.
    const thumbnailsPromise = Promise.all(newFiles.map((file) => generateImageThumbnail(file)));
    // A failed upload takes its seeded metadata and object urls back out — the composer renders from those, and
    // The send button gates on the room's upload count, so leaving either behind strands the room's composer.
    // Whatever already reached blob storage goes with it, through the same discard the composer's own delete
    // Affordance uses: a row that leaves the list without being sent is a blob nothing can ever name again.
    let seededFileSasEntities: MessageFileSasEntity[] = [];
    await withFinalizerAsync(
      () =>
        getResultAsync(async () => {
          const fileSasEntities = await uploadFileToSas({
            files: newFiles,
            generateUploadFileSasEntities: (uploadFiles) =>
              $trpc.message.generateUploadFileSasEntities.query({ files: uploadFiles, roomId }),
            onUploadProgress: ({ id }, progress) => {
              storeUploadFileProgress(roomId, id, progress);
            },
            onUploadStart: (newFileSasEntities) => {
              seededFileSasEntities = newFileSasEntities;
              // Seed each file's metadata + object url once the write targets exist so Vue renders progress
              storeUploadFiles(
                roomId,
                newFileSasEntities.map(({ id, token }, index) => ({ file: takeOne(newFiles, index), id, token })),
              );
            },
          });
          // Thumbnails are decorative and best-effort: the renderer falls back to the original whenever the
          // Thumbnail blob is missing, so a failed downscale or a failed thumbnail PUT costs a bigger image,
          // Never an attachment. Reverting here instead would throw away originals that uploaded perfectly.
          // Which ones landed is recorded on the file itself — the renderer must not have to tell a thumbnail
          // That was never written apart from one whose read SAS expired, since both reach it as a load error
          const thumbnails = await thumbnailsPromise;
          const thumbnailUploads = fileSasEntities.flatMap(({ id, thumbnailSasUrl }, index) => {
            const thumbnail = takeOne(thumbnails, index);
            return thumbnailSasUrl && thumbnail ? [{ id, sasUrl: thumbnailSasUrl, thumbnail }] : [];
          });
          const thumbnailIds = (
            await Promise.all(
              thumbnailUploads.map(({ id, sasUrl, thumbnail }) =>
                getResultAsync(() => uploadBlocks(thumbnail, sasUrl)).match(
                  () => [id],
                  (error) => {
                    console.error(error);
                    return [];
                  },
                ),
              ),
            )
          ).flat();
          storeUploadFileThumbnails(roomId, thumbnailIds);
        }).match(noop, async (error) => {
          await discardUploadFiles(
            roomId,
            seededFileSasEntities.map(({ id }) => id),
          );
          // A rejected SAS request is one of the codes errorLink owns, so it has already told the user; a failed
          // Blob PUT is not a tRPC call at all and this is the only thing that can
          if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
        }),
      () => {
        storeUploadEnd(roomId);
      },
    );
  };
};
