import type { ResourceType } from "@esposter/db-schema";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The FileAssets round-trip for one file: SAS PUT target -> direct blob upload -> refreshed read url
export const useUploadResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  return async (file: File) => {
    const { generateDownloadFileSasUrls, generateUploadFileSasEntities } = getResourceMutations(type);
    // The dispatch map exposes the asset procedures only for types declaring the capability
    if (!generateDownloadFileSasUrls || !generateUploadFileSasEntities)
      throw new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, type);

    const idValue = toValue(id);
    const { id: fileId, sasUrl } = takeOne(
      await generateUploadFileSasEntities({ files: [{ filename: file.name, mimetype: file.type }], id: idValue }),
    );
    await uploadBlocks(file, sasUrl);
    return takeOne(
      await generateDownloadFileSasUrls({
        files: [{ filename: file.name, id: fileId, mimetype: file.type }],
        id: idValue,
      }),
    );
  };
};
