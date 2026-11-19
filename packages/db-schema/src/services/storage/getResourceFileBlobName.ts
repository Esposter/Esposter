import type { ResourceInResource } from "#src/schema/resource/resourcesInResource";

import { getResourceFilesPrefix } from "#src/services/storage/getResourceFilesPrefix";

// The one blob a resource's binary asset is written to, named by its content hash. The web app mints its presigned url for
// This name, the data export and the snapshot sweep read it back under the same name, so it is built here only.
export const getResourceFileBlobName = (resourceId: ResourceInResource["id"], hash: string) =>
  `${getResourceFilesPrefix(resourceId)}${hash}`;
