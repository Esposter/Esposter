import type { MessageFilePresignedUrlEntity } from "#shared/models/message/file/MessageFilePresignedUrlEntity";
import type { ComposerTarget } from "#src/models/message/ComposerTarget";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { generateImageThumbnail } from "#src/services/file/generateImageThumbnail";
import { uploadFilesToPresignedUrls } from "#src/services/file/uploadFilesToPresignedUrls";
import { uploadFileToUrl } from "#src/services/file/uploadFileToUrl";
import { validateFileWithAlert } from "#src/services/file/validateFileWithAlert";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";
import { useUploadFileStore } from "#src/store/message/input/uploadFile";
import { useRoomStore } from "#src/store/message/room/index";
import { FILE_MAX_LENGTH, getMimeCategory } from "@esposter/db-schema";
import { getResultAsync, noop, takeOne, withFinalizerAsync } from "@esposter/shared";

// The composer the files are being attached to, passed in rather than read from the current room: the thread
// Pane's composer accepts its own attachments, and both are on screen at once
export const useUploadFiles = (target: MaybeRefOrGetter<ComposerTarget>) => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const uploadFileStore = useUploadFileStore();
  const {
    discardUploadFiles,
    getComposerFiles,
    storeUploadEnd,
    storeUploadFileProgress,
    storeUploadFiles,
    storeUploadFileThumbnails,
    storeUploadStart,
  } = uploadFileStore;
  return async (newFiles: File[] | null) => {
    const targetValue = toValue(target);
    const files = getComposerFiles(targetValue);
    if (!targetValue.roomId || !newFiles) return;
    else if (files.length + newFiles.length > FILE_MAX_LENGTH) {
      createAlert(`You can only upload ${FILE_MAX_LENGTH} files at a time!`, "error");
      return;
    }

    const room = rooms.value.find(({ id }) => id === targetValue.roomId);
    // Mirror the server chokepoint's platform-cap clamp so a room limit above the cap fails here, not at the presigned url query.
    const maxFileSizeBytes = Math.min(room?.maxFileSizeBytes || MAX_FILE_REQUEST_SIZE, MAX_FILE_REQUEST_SIZE);
    // Validate before the presigned url query and before rendering metadata so a rejected file is surfaced loudly. One
    // Rejected file rejects the whole drop, naming it, rather than silently uploading the rest of the selection.
    for (const file of newFiles)
      if (!validateFileWithAlert(file, maxFileSizeBytes)) return;
      else if (room && !room.allowedMimeCategories.includes(getMimeCategory(file.type))) {
        createAlert(
          `${file.name}: this room only allows ${room.allowedMimeCategories.join(", ").toLowerCase()} attachments!`,
          "error",
        );
        return;
      }

    const { roomId } = targetValue;
    storeUploadStart(targetValue);
    // Downscale image thumbnails while the originals upload so both land in one pass.
    const thumbnailsPromise = Promise.all(newFiles.map((file) => generateImageThumbnail(file)));
    // A failed upload takes its seeded metadata and object urls back out — the composer renders from those, and
    // The send button gates on the room's upload count, so leaving either behind strands the room's composer.
    // Whatever already reached blob storage goes with it, through the same discard the composer's own delete
    // Affordance uses: a row that leaves the list without being sent is a blob nothing can ever name again.
    let seededFilePresignedUrlEntities: MessageFilePresignedUrlEntity[] = [];
    await withFinalizerAsync(
      () =>
        getResultAsync(async () => {
          const filePresignedUrlEntities = await uploadFilesToPresignedUrls({
            files: newFiles,
            generateUploadFilePresignedUrlEntities: (uploadFiles) =>
              $trpc.message.generateUploadFilePresignedUrlEntities.mutate({ files: uploadFiles, roomId }),
            onUploadProgress: ({ id }, progress) => {
              storeUploadFileProgress(targetValue, id, progress);
            },
            onUploadStart: (newFilePresignedUrlEntities) => {
              seededFilePresignedUrlEntities = newFilePresignedUrlEntities;
              // Seed each file's metadata + object url once the write targets exist so Vue renders progress
              storeUploadFiles(
                targetValue,
                newFilePresignedUrlEntities.map(({ id, token }, index) => ({
                  file: takeOne(newFiles, index),
                  id,
                  token,
                })),
              );
            },
          });
          // Thumbnails are decorative and best-effort: the renderer falls back to the original whenever the
          // Thumbnail blob is missing, so a failed downscale or a failed thumbnail PUT costs a bigger image,
          // Never an attachment. Reverting here instead would throw away originals that uploaded perfectly.
          // Which ones landed is recorded on the file itself — the renderer must not have to tell a thumbnail
          // That was never written apart from one whose presigned read url expired, since both reach it as a load error
          const thumbnails = await thumbnailsPromise;
          const thumbnailUploads = filePresignedUrlEntities.flatMap(({ id, thumbnailPresignedUrl }, index) => {
            const thumbnail = takeOne(thumbnails, index);
            return thumbnailPresignedUrl && thumbnail ? [{ id, presignedUrl: thumbnailPresignedUrl, thumbnail }] : [];
          });
          const thumbnailIds = (
            await Promise.all(
              thumbnailUploads.map(({ id, presignedUrl, thumbnail }) =>
                getResultAsync(() => uploadFileToUrl(thumbnail, presignedUrl))
                  .map(() => [id])
                  .orTee(console.error)
                  .unwrapOr([]),
              ),
            )
          ).flat();
          storeUploadFileThumbnails(targetValue, thumbnailIds);
        }).match(noop, async (error) => {
          await discardUploadFiles(
            targetValue,
            seededFilePresignedUrlEntities.map(({ id }) => id),
          );
          createErrorAlert(error);
        }),
      () => {
        storeUploadEnd(targetValue);
      },
    );
  };
};
