import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { getMimeCategory, MimeCategory, READ_SAS_DURATION_MS } from "@esposter/db-schema";
import { getResultAsync, takeOne } from "@esposter/shared";

// Resolves the read urls a batch of attachments needs — the original for every file and, for images, the
// Thumbnail the message list renders inline — in one round trip per kind, however many files are on screen.
export const useReadFileUrls = () => {
  const { $trpc } = useNuxtApp();
  return async (files: FileEntity[], roomId: string): Promise<Map<FileEntity["id"], ReadFileUrl>> => {
    const fileUrlMap = new Map<FileEntity["id"], ReadFileUrl>();
    if (files.length === 0) return fileUrlMap;

    const imageFiles = files.filter(({ mimetype }) => getMimeCategory(mimetype) === MimeCategory.Image);
    const [downloadFileSasUrls, downloadThumbnailSasUrls] = await Promise.all([
      $trpc.message.generateDownloadFileSasUrls.query({
        files: files.map(({ filename, id, mimetype }) => ({ filename, id, mimetype })),
        roomId,
      }),
      // The thumbnail is decoration on top of the original, so its query resolves to nothing on failure
      // Instead of failing the batch the message bubble actually needs.
      imageFiles.length > 0
        ? getResultAsync(() =>
            $trpc.message.generateDownloadThumbnailSasUrls.query({
              files: imageFiles.map(({ id }) => ({ id })),
              roomId,
            }),
          ).unwrapOr([])
        : [],
    ]);
    const expiresAt = dayjs().add(READ_SAS_DURATION_MS, "ms").valueOf();
    for (const [index, { id }] of files.entries())
      fileUrlMap.set(id, { expiresAt, url: takeOne(downloadFileSasUrls, index) });
    // A thumbnail url is minted from the id alone, so it can point at a thumbnail blob that was never
    // Generated — the renderer falls back to the original on load error rather than probing for existence.
    if (downloadThumbnailSasUrls.length > 0)
      for (const [index, { id }] of imageFiles.entries()) {
        const fileUrl = fileUrlMap.get(id);
        if (fileUrl) fileUrl.thumbnailUrl = takeOne(downloadThumbnailSasUrls, index);
      }

    return fileUrlMap;
  };
};
