import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourceInResource } from "@esposter/db-schema";

import { resourceTable } from "#src/services/resource/overlay/constants";

// An entry that sets the named fields of a resource the overlay holds. A resource it does not hold is left as it is, so the
// Write it belongs to changes nothing on screen
export const getResourcePatchEntry =
  (id: ResourceInResource["id"], patch: Partial<ResourceInResource>): Entry =>
  (view) => {
    const row = view.get(resourceTable, [id]);
    if (row) view.set(resourceTable, [id], { ...row, ...patch });
  };
