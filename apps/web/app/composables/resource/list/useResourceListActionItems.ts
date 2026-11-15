// @unocss-include
import type { Item } from "#src/models/shared/Item";
import type { ResourceInResource } from "@esposter/db-schema";

import { getDeleteResourceItem } from "#src/services/resource/getDeleteResourceItem";
import { getRenameResourceItem } from "#src/services/resource/getRenameResourceItem";
import { getResourceLinkItems } from "#src/services/resource/getResourceLinkItems";
import { useBlueprintCaptureDialogStore } from "#src/store/resource/blueprint/captureDialog";
import { useListDialogStore } from "#src/store/resource/listDialog";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ
export const useResourceListActionItems = () => {
  const listDialogStore = useListDialogStore();
  const { deletingIds, renamingId } = storeToRefs(listDialogStore);
  const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
  const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
  const getActionItems = (resource: ResourceInResource): Item[] => [
    ...getResourceLinkItems(resource.id),
    {
      icon: "i-mdi:floor-plan",
      onClick: () => {
        captureIds.value = [resource.id];
      },
      title: "Save as blueprint",
    },
    getRenameResourceItem(() => {
      renamingId.value = resource.id;
    }),
    getDeleteResourceItem(() => {
      deletingIds.value = [resource.id];
    }),
  ];
  return { getActionItems };
};
