import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { Table } from "#src/models/shared/overlay/Table";

import { createTable } from "#src/services/shared/overlay/createTable";
import { bansInMessage } from "@esposter/db-schema";

// A row carries its banned user's name in the room, which is the name the panel shows, so the table holds the whole
// Read row
export const banTable: Table<BanInRoom, typeof bansInMessage> = createTable(bansInMessage);
