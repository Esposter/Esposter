import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { BlobStorageStatusError } from "@/models/azure/container/BlobStorageStatusError";
import { HTTP_STATUS_PRECONDITION_FAILED } from "@/services/azure/container/constants";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { getResultAsync } from "@esposter/shared";

// The FileAssets round-trip for one file: the file is addressed by the hash of its bytes, uploaded only when the server does
// Not already hold that object, and the stable asset url is handed back for the editor to embed. Reads resolve through
// /api/resource-assets, so content never carries a signature. Only a FileAssets type can upload, so the capability is the
// Parameter type rather than a check that throws once the upload runs
export const useUploadResourceFile = (type: FileAssetsResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceRouter = useResourceRouter();
  return async (file: File) => {
    const { generateUploadFileSasEntities } = getResourceRouter(type);
    const idValue = toValue(id);
    const hash = await getSha256Hex(new Uint8Array(await file.arrayBuffer()));
    const assetUrl = getResourceAssetUrl(getResourceFileBlobName(idValue, hash));
    return getResultAsync(() =>
      uploadFileToSas<ResourceFileSasEntity>({
        checkIsUploadSkipped: ({ isHeld }) => isHeld,
        files: [file],
        // UploadFileToSas describes the batch by its name, type and size, so the hash is carried in alongside them
        generateUploadFileSasEntities: (files) =>
          generateUploadFileSasEntities.query({
            files: files.map((fileEntity) => ({ ...fileEntity, hash })),
            id: idValue,
          }),
        isCreateOnly: true,
      }),
    ).match(
      () => assetUrl,
      (error) => {
        // The create-only commit answers 412 when this address already holds the bytes, so the upload is complete there
        if (error instanceof BlobStorageStatusError && error.status === HTTP_STATUS_PRECONDITION_FAILED)
          return assetUrl;
        throw error;
      },
    );
  };
};
