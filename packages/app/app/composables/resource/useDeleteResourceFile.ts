import type { ResourceType } from "@esposter/db-schema";

import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { AzureContainer } from "@esposter/db-schema";

export const useDeleteResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  const executeMutation = useMutation();
  return async (downloadFileSasUrl: string) => {
    const { deleteFile } = getResourceMutations(type);
    if (!deleteFile) return;

    const idValue = toValue(id);
    // Only the SAS url survives in the editor model, so the resource-relative blob path is recovered from it.
    // Anything outside this resource's files directory is not ours to delete, so it is ignored rather than sent
    const filesDirectoryPrefix = `/${AzureContainer.ResourceAssets}/${getFilesDirectoryName(idValue)}/`;
    const pathname = decodeURIComponent(new URL(downloadFileSasUrl).pathname);
    if (!pathname.startsWith(filesDirectoryPrefix)) return;

    const blobPath = pathname.slice(filesDirectoryPrefix.length);
    await executeMutation(() => deleteFile({ blobPath, id: idValue }));
  };
};
