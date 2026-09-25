// @unocss-include
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getResourceLinkItems } from "@/services/resource/getResourceLinkItems";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";
import { useListDialogStore } from "@/store/resource/listDialog";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ.
export const useResourceListActionItems = () => {
  const listDialogStore = useListDialogStore();
  const { deletingId, renamingId } = storeToRefs(listDialogStore);
  const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
  const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
  const getActionItems = ({ id }: Resource): Item[] => [
    ...getResourceLinkItems(id),
    {
      icon: "i-mdi:floor-plan",
      onClick: () => {
        captureIds.value = [id];
      },
      title: "Save as blueprint",
    },
    {
      meaning: UiIconMeaning.Edit,
      onClick: () => {
        renamingId.value = id;
      },
      title: "Rename",
    },
    {
      isDanger: true,
      meaning: UiIconMeaning.Delete,
      onClick: () => {
        deletingId.value = id;
      },
      title: "Delete",
    },
  ];
  return { getActionItems };
};
