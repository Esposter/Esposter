// @unocss-include
import type { Item } from "#src/models/shared/Item";
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SAVE_AS_BLUEPRINT_TITLE } from "#src/services/resource/constants";
import { getResourceEditDeleteItems } from "#src/services/resource/getResourceEditDeleteItems";
import { getResourceLinkItems } from "#src/services/resource/getResourceLinkItems";
import { useBlueprintCaptureDialogStore } from "#src/store/resource/blueprint/captureDialog";
import { useListDialogStore } from "#src/store/resource/listDialog";
import { ResourceType } from "@esposter/db-schema";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ
export const useResourceListActionItems = () => {
  const listDialogStore = useListDialogStore();
  const { deletingIds, renamingId } = storeToRefs(listDialogStore);
  const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
  const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
  const getActionItems = (resource: ResourceInResource): Item[] => {
    const [renameItem, deleteItem] = getResourceEditDeleteItems({
      onDelete: () => {
        deletingIds.value = [resource.id];
      },
      onEdit: () => {
        renamingId.value = resource.id;
      },
    });
    return [
      ...getResourceLinkItems(resource.id),
      {
        icon: ResourceDefinitionMap[ResourceType.Blueprint].icon,
        onClick: () => {
          captureIds.value = [resource.id];
        },
        title: SAVE_AS_BLUEPRINT_TITLE,
      },
      renameItem,
      deleteItem,
    ];
  };
  return { getActionItems };
};
