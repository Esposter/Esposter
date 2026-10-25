import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

import { generateWriteSasUrl } from "#src/services/azure/container/generateWriteSasUrl";
import { getFileBlobNames } from "#src/services/azure/container/getFileBlobNames";
import { getMimeCategory, MAX_THUMBNAIL_BYTES, MimeCategory, THUMBNAIL_CONTENT_TYPE } from "@esposter/db-schema";

// Every target is named before the first is signed, and `reserve` is handed the whole set before any SAS exists, so a
// refused reserve throws with no write target minted. The caller's reserve decides what the bytes are charged against
export const generateUploadFileSasEntities = async (
  containerClient: ContainerClient,
  files: (Pick<FileEntity, "filename" | "mimetype"> & { size: number })[],
  prefix: string,
  options: {
    reserve: (reservations: { blobName: string; declaredBytes: number }[]) => Promise<void>;
    withThumbnail?: boolean;
  },
): Promise<FileSasEntity[]> => {
  const uploads = files.map(({ filename, mimetype, size }) => {
    const id: string = crypto.randomUUID();
    const { blobName, thumbnailBlobName } = getFileBlobNames(prefix, id, filename);
    // Images get a sibling thumbnail write target so the client can upload a downscaled preview alongside.
    const hasThumbnail = Boolean(options.withThumbnail) && getMimeCategory(mimetype) === MimeCategory.Image;
    return { blobName, hasThumbnail, id, mimetype, size, thumbnailBlobName };
  });

  await options.reserve(
    uploads.flatMap(({ blobName, hasThumbnail, size, thumbnailBlobName }) =>
      hasThumbnail
        ? [
            { blobName, declaredBytes: size },
            { blobName: thumbnailBlobName, declaredBytes: MAX_THUMBNAIL_BYTES },
          ]
        : [{ blobName, declaredBytes: size }],
    ),
  );

  return Promise.all(
    uploads.map(async ({ blobName, hasThumbnail, id, mimetype, thumbnailBlobName }) => {
      const entity: FileSasEntity = {
        id,
        sasUrl: await generateWriteSasUrl(containerClient.getBlockBlobClient(blobName), { contentType: mimetype }),
      };
      if (hasThumbnail)
        entity.thumbnailSasUrl = await generateWriteSasUrl(containerClient.getBlockBlobClient(thumbnailBlobName), {
          contentType: THUMBNAIL_CONTENT_TYPE,
        });

      return entity;
    }),
  );
};
