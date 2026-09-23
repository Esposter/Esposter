// @unocss-include
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";
import { useListDialogStore } from "@/store/resource/listDialog";
import { RoutePath } from "@esposter/shared";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ.
export const useResourceListActionItems = () => {
  const listDialogStore = useListDialogStore();
  const { deletingId, renamingId } = storeToRefs(listDialogStore);
  const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
  const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
  const getActionItems = ({ id }: Resource): Item[] => [
    {
      icon: "i-mdi:open-in-new",
      onClick: () => {
        window.open(RoutePath.Resource(id), "_blank");
      },
      title: "Open in new tab",
    },
    { icon: "i-mdi:link-variant", onClick: () => copyLinkToClipboard(RoutePath.Resource(id)), title: "Copy link" },
    {
      icon: "i-mdi:floor-plan",
      onClick: () => {
        captureIds.value = [id];
      },
      title: "Save as blueprint",
    },
    {
      icon: "i-mdi:pencil",
      onClick: () => {
        renamingId.value = id;
      },
      title: "Rename",
    },
    {
      color: "error",
      icon: "i-mdi:delete",
      onClick: () => {
        deletingId.value = id;
      },
      title: "Delete",
    },
  ];
  return { getActionItems };
};
