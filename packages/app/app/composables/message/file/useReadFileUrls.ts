import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { checkHasThumbnail } from "@/services/message/file/checkHasThumbnail";
import { READ_SAS_DURATION_MS } from "@esposter/db-schema";
import { getResultAsync, takeOne } from "@esposter/shared";

// Resolves the read urls a batch of attachments needs — the original for every file and, for images, the
// Thumbnail the message list renders inline — in one round trip per kind, however many files are on screen.
// Every read here is one nobody asked for — a page that scrolled, a message that arrived, a sweep on a timer —
// So the background marker is set once, here, for all of them: a failure has no action the user could take and
// No command of theirs to attribute it to.
export const useReadFileUrls = () => {
  const { $trpc } = useNuxtApp();
  return async (files: FileEntity[], roomId: string): Promise<Map<FileEntity["id"], ReadFileUrl>> => {
    const fileUrlMap = new Map<FileEntity["id"], ReadFileUrl>();
    if (files.length === 0) return fileUrlMap;
    // A file whose upload recorded no thumbnail gets no thumbnail url minted for it — nothing downstream has
    // To discover that from a failed image load
    const imageFiles = files.filter((file) => checkHasThumbnail(file));
    const [downloadFileSasUrls, downloadThumbnailSasUrls] = await Promise.all([
      $trpc.message.generateDownloadFileSasUrls.query(
        {
          files: files.map(({ filename, id, mimetype }) => ({ filename, id, mimetype })),
          roomId,
        },
        { context: { isBackground: true } },
      ),
      // The thumbnail is decoration on top of the original, so its query resolves to nothing on failure
      // Instead of failing the batch the message bubble actually needs.
      imageFiles.length > 0
        ? getResultAsync(() =>
            $trpc.message.generateDownloadThumbnailSasUrls.query(
              {
                files: imageFiles.map(({ id }) => ({ id })),
                roomId,
              },
              { context: { isBackground: true } },
            ),
          ).unwrapOr([])
        : [],
    ]);
    const expiresAt = Date.now() + READ_SAS_DURATION_MS;
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
