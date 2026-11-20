import type { Entry } from "#src/models/shared/overlay/Entry";

import { favoriteTable } from "#src/services/resource/overlay/constants";

// A live star is removed, and any other is set. A star set again takes the time it is set at, which is where the list
// Places it, as the server does
export const getToggleFavoriteEntry =
  (userId: string, resourceId: string, now: Date): Entry =>
  (view) => {
    const key: [string, string] = [userId, resourceId];
    const favorite = view.get(favoriteTable, key);
    if (favorite && !favorite.deletedAt) view.set(favoriteTable, key, { ...favorite, deletedAt: now });
    else view.set(favoriteTable, key, { createdAt: now, deletedAt: null, resourceId, updatedAt: now, userId });
  };
