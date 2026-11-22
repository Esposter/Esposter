import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { banTable } from "#src/services/message/user/ban/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The ban as its unban leaves it: removed at once, as the tombstone the server's answer confirms
export const getDeleteBanEntry = (roomId: BanInRoom["roomId"], userId: BanInRoom["userId"], deletedAt: Date): Entry =>
  getHeldRowEntry(banTable, [roomId, userId], (row) => ({ ...row, deletedAt }));
