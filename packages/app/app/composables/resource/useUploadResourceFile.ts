import type { ResourceType } from "@esposter/db-schema";

import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { DatabaseEntityType } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The FileAssets round-trip for one file: upload through a SAS entity, then hand back the stable asset url
// The editor embeds — reads resolve through /api/resource-assets, so content never carries a signature
export const useUploadResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  return async (file: File) => {
    const { generateUploadFileSasEntities } = getResourceMutations(type);
    // The dispatch map exposes the asset procedures only for types declaring the capability
    if (!generateUploadFileSasEntities)
      throw new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, type);

    const idValue = toValue(id);
    const { id: fileId } = takeOne(
      await uploadFileToSas({
        files: [file],
        generateUploadFileSasEntities: (files) => generateUploadFileSasEntities({ files, id: idValue }),
      }),
    );
    return getResourceAssetUrl(`${getFilesDirectoryName(idValue)}/${fileId}${ID_SEPARATOR}${file.name}`);
  };
};
