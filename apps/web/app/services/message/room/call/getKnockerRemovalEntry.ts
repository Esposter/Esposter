import type { Entry } from "#src/models/shared/overlay/Entry";

import { knockerTable } from "#src/services/message/room/call/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// A let-in and a dismissal take the knocker out of the lobby at once, as the tombstone the server leaves it.
// The server's answer confirms that tombstone; a refused one drops the entry, and the knocker is back where it stood.
export const getKnockerRemovalEntry = (knockerId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(knockerTable, [knockerId], (row) => ({ ...row, deletedAt }));
