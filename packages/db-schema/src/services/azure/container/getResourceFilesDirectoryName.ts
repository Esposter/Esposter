import type { ResourceInResource } from "#src/schema/resource/resourcesInResource";

import { FILES_DIRECTORY_SEGMENT } from "#src/services/resource/constants";

// The directory a resource's binary assets are kept under in the resource-assets container. The one blob name
// Per asset and the prefix the file delete sweeps both start from it, so the directory is spelled here only.
export const getResourceFilesDirectoryName = (resourceId: ResourceInResource["id"]) =>
  `${resourceId}/${FILES_DIRECTORY_SEGMENT}`;
