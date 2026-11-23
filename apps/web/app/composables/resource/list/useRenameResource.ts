import type { ResourceInResource } from "@esposter/db-schema";

// Owned here rather than in the dialog because the dialog closes on submit — the row the rename applies to belongs to
// The List, which outlives the round trip
export const useRenameResource = (resource: Ref<ResourceInResource | undefined>, refresh: () => Promise<void>) => {
  const { updateResource } = useResourceWrite(refresh);
  return (name: string) => {
    const resourceValue = resource.value;
    if (!resourceValue) return;

    updateResource(resourceValue, { name });
  };
};
