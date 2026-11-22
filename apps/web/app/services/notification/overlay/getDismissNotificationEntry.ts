import type { Entry } from "#src/models/shared/overlay/Entry";

import { notificationTable } from "#src/services/notification/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// A dismissal leaves the row at once, as the tombstone its answer confirms
export const getDismissNotificationEntry = (id: string, deletedAt: Date): Entry =>
  getHeldRowEntry(notificationTable, [id], (row) => ({ ...row, deletedAt }));
