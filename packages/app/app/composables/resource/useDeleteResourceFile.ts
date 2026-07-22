import type { ResourceType } from "@esposter/db-schema";

import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResult } from "@esposter/shared";

export const useDeleteResourceFile = (type: ResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceMutations = useResourceMutations();
  const { executeMutation } = useMutation();
  return async (url: string) => {
    const { deleteFile } = getResourceMutations(type);
    if (!deleteFile) return;

    const idValue = toValue(id);
    // Only the stable asset url survives in the editor model, so the blob path is recovered from it.
    // Anything outside this resource's files directory is not ours to delete, so it is ignored rather than sent
    const filesDirectoryPrefix = `${RESOURCE_ASSETS_URL_PREFIX}/${getFilesDirectoryName(idValue)}/`;
    if (!url.startsWith(filesDirectoryPrefix)) return;

    // A path that decodes to nothing or re-introduces a separator is not a file segment this resource owns
    const blobPath = getResult(() => decodeURIComponent(url.slice(filesDirectoryPrefix.length))).unwrapOr("");
    if (!blobPath || blobPath.includes("/") || blobPath.includes("\\")) return;
    // Keyed per blob so concurrent file deletions never stale-drop each other
    await executeMutation(() => deleteFile({ blobPath, id: idValue }), { key: blobPath });
  };
};
