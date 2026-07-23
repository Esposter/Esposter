import type { DownloadFileUrl } from "@/models/message/file/DownloadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { getMimeCategory, MimeCategory } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

// Resolves the read urls a batch of attachments needs — the original for every file and, for images, the
// Thumbnail the message list renders inline — in one round trip per kind, however many files are on screen.
export const useReadFileUrls = () => {
  const { $trpc } = useNuxtApp();
  return async (files: FileEntity[], roomId: string): Promise<Map<FileEntity["id"], DownloadFileUrl>> => {
    const fileUrlMap = new Map<FileEntity["id"], DownloadFileUrl>();
    if (files.length === 0) return fileUrlMap;

    const imageFiles = files.filter(({ mimetype }) => getMimeCategory(mimetype) === MimeCategory.Image);
    const [downloadFileSasUrls, downloadThumbnailSasUrls] = await Promise.all([
      $trpc.message.generateDownloadFileSasUrls.query({
        files: files.map(({ filename, id, mimetype }) => ({ filename, id, mimetype })),
        roomId,
      }),
      imageFiles.length > 0
        ? $trpc.message.generateDownloadThumbnailSasUrls.query({
            files: imageFiles.map(({ id }) => ({ id })),
            roomId,
          })
        : [],
    ]);
    for (const [index, { id }] of files.entries()) fileUrlMap.set(id, { url: takeOne(downloadFileSasUrls, index) });
    // A thumbnail url is minted from the id alone, so it can point at a blob that was never generated — the
    // Renderer falls back to the original on load error rather than probing for existence here.
    for (const [index, { id }] of imageFiles.entries()) {
      const fileUrl = fileUrlMap.get(id);
      if (fileUrl) fileUrl.thumbnailUrl = takeOne(downloadThumbnailSasUrls, index);
    }

    return fileUrlMap;
  };
};
