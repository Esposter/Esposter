// @unocss-include
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getResourceLinkItems } from "@/services/resource/getResourceLinkItems";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";
import { useListDialogStore } from "@/store/resource/listDialog";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ. Delete asks nothing: it moves the resource to the Recycle bin,
// And the toast it leaves restores it
export const useResourceListActionItems = (deleteResources: (resources: Resource[]) => Promise<void>) => {
  const listDialogStore = useListDialogStore();
  const { renamingId } = storeToRefs(listDialogStore);
  const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
  const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
  const getActionItems = (resource: Resource): Item[] => [
    ...getResourceLinkItems(resource.id),
    {
      icon: "i-mdi:floor-plan",
      onClick: () => {
        captureIds.value = [resource.id];
      },
      title: "Save as blueprint",
    },
    {
      meaning: UiIconMeaning.Edit,
      onClick: () => {
        renamingId.value = resource.id;
      },
      title: "Rename",
    },
    {
      isDanger: true,
      meaning: UiIconMeaning.Delete,
      onClick: async () => {
        await deleteResources([resource]);
      },
      title: "Delete",
    },
  ];
  return { getActionItems };
};
