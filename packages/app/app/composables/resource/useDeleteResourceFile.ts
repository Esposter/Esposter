import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";

import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { BLOB_SEGMENT_REGEX } from "@esposter/db-schema";
import { getDecodedUriComponent } from "@esposter/shared";

// Only a FileAssets type has files to delete, so the capability is the parameter type — a type without it is
// Rejected where the composable is called rather than silently doing nothing once it runs
export const useDeleteResourceFile = (type: FileAssetsResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceRouter = useResourceRouter();
  const { executeMutation } = useMutation();
  return async (url: string) => {
    const idValue = toValue(id);
    // Only the stable asset url survives in the editor model, so the blob path is recovered from it.
    // Anything outside this resource's files directory is not ours to delete, so it is ignored rather than sent
    const filesDirectoryPrefix = `${RESOURCE_ASSETS_URL_PREFIX}/${getFilesDirectoryName(idValue)}/`;
    if (!url.startsWith(filesDirectoryPrefix)) return;
    // What counts as a segment this resource owns is the server's definition, imported rather than restated —
    // A local copy that accepts one more form than the server does turns a suppressed affordance into a request
    // The server rejects, and drifts the moment either side is tightened
    const blobPath = getDecodedUriComponent(url.slice(filesDirectoryPrefix.length), "");
    if (!BLOB_SEGMENT_REGEX.test(blobPath)) return;
    await executeMutation(() => getResourceRouter(type).deleteFile.mutate({ blobPath, id: idValue }), {
      key: blobPath,
    });
  };
};
