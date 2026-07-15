import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

// The row ⋮ menu and the right-click menu are the same commands behind two triggers, so the items have one definition.
// Plain "Open" is deliberately absent — clicking the row already does that, and a second visible affordance for it
// Only makes the user wonder whether the two differ.
export const useResourceListActionItems = () => {
  const listDialogStore = useListDialogStore();
  const { deletingId, renamingId } = storeToRefs(listDialogStore);
  const getActionItems = ({ id }: Resource): Item[] => [
    {
      icon: "mdi-open-in-new",
      onClick: () => {
        window.open(RoutePath.Resource(id), "_blank");
      },
      title: "Open in new tab",
    },
    {
      icon: "mdi-link-variant",
      onClick: () =>
        getResultAsync(() =>
          window.navigator.clipboard.writeText(`${window.location.origin}${RoutePath.Resource(id)}`),
        ).match(noop, noop),
      title: "Copy link",
    },
    {
      icon: "mdi-pencil",
      onClick: () => {
        renamingId.value = id;
      },
      title: "Rename",
    },
    {
      color: "error",
      icon: "mdi-delete",
      onClick: () => {
        deletingId.value = id;
      },
      title: "Delete",
    },
  ];
  return { getActionItems };
};
