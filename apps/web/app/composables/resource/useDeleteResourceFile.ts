import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getDecodedUriComponent } from "#shared/util/text/getDecodedUriComponent";
import { getResourceFilesPrefix } from "@esposter/db-schema";
import { ASSET_HASH_REGEX } from "@esposter/shared";

// Only a FileAssets type has files to delete, so the capability is the parameter type — a type without it is
// Rejected where the composable is called rather than silently doing nothing once it runs. The resource is named at each
// Delete, since a file can outlive the resource that was open when it was uploaded
export const useDeleteResourceFile = (type: FileAssetsResourceType) => {
  const getResourceRouter = useResourceRouter();
  const { executeBackgroundMutation } = useMutation();
  return (id: string, url: string) => {
    // Only the stable asset url survives in the editor model, so the blob path is recovered from it.
    // Anything outside this resource's files directory is not ours to delete, so it is ignored rather than sent
    const filesDirectoryPrefix = getResourceAssetUrl(getResourceFilesPrefix(id));
    if (!url.startsWith(filesDirectoryPrefix)) return;
    // A file is named by its content hash, which is the server's definition, imported rather than restated —
    // A local copy that accepts one more form than the server does turns a suppressed affordance into a request
    // The server rejects, and drifts the moment either side is tightened
    const blobPath = getDecodedUriComponent(url.slice(filesDirectoryPrefix.length), "");
    if (!ASSET_HASH_REGEX.test(blobPath)) return;
    executeBackgroundMutation(() => getResourceRouter(type).deleteFile.mutate({ blobPath, id }), {
      // Nothing on screen waits on the delete, and the editor that asked for it may be gone by the time it answers, so a
      // Failure is logged rather than alerted
      key: blobPath,
      onError: console.error,
    });
  };
};
