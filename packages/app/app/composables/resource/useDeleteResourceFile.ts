import type { ResourceType } from "@esposter/db-schema";

import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { BLOB_SEGMENT_REGEX } from "@esposter/db-schema";
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

    // What counts as a segment this resource owns is the server's definition, imported rather than restated —
    // A local copy that accepts one more form than the server does turns a suppressed affordance into a request
    // The server rejects, and drifts the moment either side is tightened
    const blobPath = getResult(() => decodeURIComponent(url.slice(filesDirectoryPrefix.length))).unwrapOr("");
    if (!BLOB_SEGMENT_REGEX.test(blobPath)) return;
    // Keyed per blob so concurrent file deletions run independently instead of queueing behind each other
    await executeMutation(() => deleteFile({ blobPath, id: idValue }), { key: blobPath });
  };
};
