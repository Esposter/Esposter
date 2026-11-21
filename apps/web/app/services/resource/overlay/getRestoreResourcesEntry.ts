import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourceInResource } from "@esposter/db-schema";

import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";

// Each row is held as a live row until its answer arrives, so the row shows again as the restore is sent
export const getRestoreResourcesEntry =
  (ids: ResourceInResource["id"][]): Entry =>
  (view) => {
    for (const id of ids) getResourcePatchEntry(id, { deletedAt: null })(view);
  };
