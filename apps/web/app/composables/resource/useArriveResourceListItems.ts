import type { ResourceListItemWithFavorite } from "#shared/models/resource/ResourceListItemWithFavorite";

import { favoriteTable, resourceTable } from "#src/services/resource/overlay/constants";
import { useOverlayStore } from "#src/store/overlay";

// Lands the rows a resource read answers: each row on the resource table, and the viewer's star beside it on the favorites
// Table, which is where every star is held. The last access is the read's rather than the row's, so it is left off the held row
export const useArriveResourceListItems = () => {
  const overlayStore = useOverlayStore();
  const { arrive } = overlayStore;
  return (items: ResourceListItemWithFavorite[]) => {
    for (const { favorite, lastAccessedAt: _lastAccessedAt, ...row } of items) {
      arrive(resourceTable, row);
      if (favorite) arrive(favoriteTable, favorite);
    }
  };
};
