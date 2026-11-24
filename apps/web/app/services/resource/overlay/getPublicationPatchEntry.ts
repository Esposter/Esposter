import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

import { publicationTable } from "#src/services/resource/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// An entry that sets the named fields of a resource's publication the overlay holds. A publication it does not hold is
// Left as it is, so the write it belongs to changes nothing on screen
export const getPublicationPatchEntry = (
  resourceId: ResourcePublicationInResource["resourceId"],
  patch: Partial<ResourcePublicationInResource>,
): Entry => getHeldRowEntry(publicationTable, [resourceId], (row) => ({ ...row, ...patch }));
