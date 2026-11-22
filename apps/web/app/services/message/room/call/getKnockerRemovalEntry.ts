import type { Entry } from "#src/models/shared/overlay/Entry";

import { knockerTable } from "#src/services/message/room/call/constants";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// A let-in and a dismissal take the knocker out of the lobby at once, as the tombstone the server leaves it. The server's
// Answer confirms that tombstone, and a refused answer drops the entry, so the knocker is back where it stood
export const getKnockerRemovalEntry = (knockerId: string, deletedAt: Date): Entry =>
  getRemovalEntry(knockerTable, [knockerId], deletedAt);
