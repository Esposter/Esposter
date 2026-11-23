import type { ResourceInResource } from "@esposter/db-schema";

import { resourceTable } from "#src/services/resource/overlay/constants";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to belongs to the
// List, which outlives the round trip
export const useRenameResource = (resource: Ref<ResourceInResource | undefined>, refresh: () => Promise<void>) => {
  const { writeOptimistic } = useResourceWrite(refresh);
  const getResourceRouter = useResourceRouter();
  return (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    const { id, type } = resourceValue;
    writeOptimistic(
      async () => createRowResponse(resourceTable, await getResourceRouter(type).updateResource.mutate({ id, name })),
      { entry: getResourcePatchEntry(id, { name }) },
    );
  };
};
