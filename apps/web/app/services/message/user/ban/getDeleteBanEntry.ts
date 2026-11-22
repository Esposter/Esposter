import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { banTable } from "#src/services/message/user/ban/constants";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// The ban as its unban leaves it: removed at once, as the tombstone the server's answer confirms
export const getDeleteBanEntry = (roomId: BanInRoom["roomId"], userId: BanInRoom["userId"], deletedAt: Date): Entry =>
  getRemovalEntry(banTable, [roomId, userId], deletedAt);
