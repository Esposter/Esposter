import type { Entry } from "#src/models/shared/overlay/Entry";

import { knockerTable } from "#src/services/message/room/call/constants";

// A let-in and a dismissal take the knocker out of the lobby at once, as the tombstone the server leaves it. The server's
// Answer confirms that tombstone, and a refused answer drops the entry, so the knocker is back where it stood
export const getKnockerRemovalEntry =
  (knockerId: string, deletedAt: Date): Entry =>
  (view) => {
    const knocker = view.get(knockerTable, [knockerId]);
    if (knocker) view.set(knockerTable, [knockerId], { ...knocker, deletedAt });
  };
