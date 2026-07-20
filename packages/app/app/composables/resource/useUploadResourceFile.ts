import type { ResourceType } from "@esposter/db-schema";

import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The FileAssets round-trip for one file, delegated to the shared uploadFileToSas service.
export const useUploadResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  return async (file: File) => {
    const { generateDownloadFileSasUrls, generateUploadFileSasEntities } = getResourceMutations(type);
    // The dispatch map exposes the asset procedures only for types declaring the capability
    if (!generateDownloadFileSasUrls || !generateUploadFileSasEntities)
      throw new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, type);

    const idValue = toValue(id);
    return takeOne(
      await uploadFileToSas({
        files: [file],
        generateDownloadFileSasUrls: (files) => generateDownloadFileSasUrls({ files, id: idValue }),
        generateUploadFileSasEntities: (files) => generateUploadFileSasEntities({ files, id: idValue }),
      }),
    );
  };
};
