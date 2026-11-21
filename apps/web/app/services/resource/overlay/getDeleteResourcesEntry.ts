import type { Entry } from "#src/models/shared/overlay/Entry";
import type { ResourceInResource } from "@esposter/db-schema";

import { getPublicationPatchEntry } from "#src/services/resource/overlay/getPublicationPatchEntry";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";

// Each resource is held as a tombstone until its answer arrives, and so is its publication, which the removal takes with it
export const getDeleteResourcesEntry =
  (ids: ResourceInResource["id"][], deletedAt: Date): Entry =>
  (view) => {
    for (const id of ids) {
      getResourcePatchEntry(id, { deletedAt })(view);
      getPublicationPatchEntry(id, { deletedAt })(view);
    }
  };
