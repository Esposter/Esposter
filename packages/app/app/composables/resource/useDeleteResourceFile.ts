import type { ResourceType } from "@esposter/db-schema";

import { AzureContainer } from "@esposter/db-schema";

export const useDeleteResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  const executeMutation = useMutation();
  return async (downloadFileSasUrl: string) => {
    const { deleteFile } = getResourceMutations(type);
    if (!deleteFile) return;

    const idValue = toValue(id);
    // Only the SAS url survives in the editor model, so the resource-relative blob path is recovered from it
    const pathname = decodeURIComponent(new URL(downloadFileSasUrl).pathname);
    const blobPath = pathname.slice(`/${AzureContainer.ResourceAssets}/${idValue}/`.length);
    await executeMutation(() => deleteFile({ blobPath, id: idValue }));
  };
};
