import type { FileEntity } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { getMimeCategory, MimeCategory } from "@esposter/db-schema";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

// Lazily resolves an image file's thumbnail read url; stays empty for non-images, previews, or missing thumbnails.
export const useReadThumbnailUrl = (
  file: MaybeRefOrGetter<FileEntity>,
  isPreview: MaybeRefOrGetter<boolean | undefined>,
) => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const thumbnailUrl = ref("");
  watchImmediate([() => toValue(file), () => toValue(isPreview)], async ([newFile, newIsPreview]) => {
    thumbnailUrl.value = "";
    const roomId = currentRoomId.value;
    if (import.meta.server || newIsPreview || !roomId || getMimeCategory(newFile.mimetype) !== MimeCategory.Image)
      return;

    await getResultAsync(() =>
      $trpc.message.generateDownloadThumbnailSasUrls.query({ files: [{ id: newFile.id }], roomId }),
    ).match((urls) => {
      thumbnailUrl.value = takeOne(urls);
    }, noop);
  });
  return thumbnailUrl;
};
