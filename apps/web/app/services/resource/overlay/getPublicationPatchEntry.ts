import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

import { publicationTable } from "#src/services/resource/overlay/constants";

// An entry that sets the named fields of a resource's publication the overlay holds. A publication it does not hold is left
// As it is, so the write it belongs to changes nothing on screen
export const getPublicationPatchEntry =
  (resourceId: ResourcePublicationInResource["resourceId"], patch: Partial<ResourcePublicationInResource>): Entry =>
  (view) => {
    const row = view.get(publicationTable, [resourceId]);
    if (row) view.set(publicationTable, [resourceId], { ...row, ...patch });
  };
