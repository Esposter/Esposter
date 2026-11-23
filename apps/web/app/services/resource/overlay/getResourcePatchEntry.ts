import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourceInResource } from "@esposter/db-schema";

import { resourceTable } from "#src/services/resource/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// An entry that sets the named fields of a resource the overlay holds. A resource it does not hold is left as it is, so
// The Write it belongs to changes nothing on screen
export const getResourcePatchEntry = (id: ResourceInResource["id"], patch: Partial<ResourceInResource>): Entry =>
  getHeldRowEntry(resourceTable, [id], (row) => ({ ...row, ...patch }));
