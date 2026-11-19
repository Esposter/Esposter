import type { ResourceInResource } from "#src/schema/resource/resourcesInResource";

import { getResourceFilesDirectoryName } from "#src/services/storage/getResourceFilesDirectoryName";

// The prefix every blob name of a resource's binary assets starts with: a listing, a delete's url check and a blob name
// All start from it, so the separator that ends the directory is spelled here only
export const getResourceFilesPrefix = (resourceId: ResourceInResource["id"]) =>
  `${getResourceFilesDirectoryName(resourceId)}/`;
