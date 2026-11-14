import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { StorageStatusError } from "@/models/file/StorageStatusError";
import { uploadFilesToPresignedUrls } from "@/services/file/uploadFilesToPresignedUrls";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { getResourceFileBlobName } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// The status a create-only upload answers when its If-None-Match finds the object already stored
const HTTP_STATUS_PRECONDITION_FAILED = 412;

// The FileAssets round-trip for one file: the file is addressed by the hash of its bytes, uploaded only when the server does
// Not already hold that object, and the stable asset url is handed back for the editor to embed. Reads resolve through
// /api/resource-assets, so content never carries a signature. Only a FileAssets type can upload, so the capability is the
// Parameter type rather than a check that throws once the upload runs
export const useUploadResourceFile = (type: FileAssetsResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceRouter = useResourceRouter();
  return async (file: File, hash?: string) => {
    const { generateUploadFileSasEntities } = getResourceRouter(type);
    const idValue = toValue(id);
    // A caller that has already hashed the bytes passes the hash, so they are read and hashed once
    const fileHash = hash ?? (await getSha256Hex(new Uint8Array(await file.arrayBuffer())));
    const assetUrl = getResourceAssetUrl(getResourceFileBlobName(idValue, fileHash));
    return getResultAsync(() =>
      uploadFilesToPresignedUrls<ResourceFileSasEntity>({
        checkIsUploadSkipped: ({ isHeld }) => isHeld,
        files: [file],
        // UploadFileToSas describes the batch by its name, type and size, so the hash is carried in alongside them
        generateUploadFileSasEntities: (files) =>
          generateUploadFileSasEntities.query({
            files: files.map((fileEntity) => ({ ...fileEntity, hash: fileHash })),
            id: idValue,
          }),
        isCreateOnly: true,
      }),
    ).match(
      () => assetUrl,
      (error) => {
        // The create-only commit answers 412 when this address already holds the bytes, so the upload is complete there
        if (error instanceof StorageStatusError && error.status === HTTP_STATUS_PRECONDITION_FAILED) return assetUrl;
        throw error;
      },
    );
  };
};
