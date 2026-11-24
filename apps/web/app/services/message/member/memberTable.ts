import type { MemberRow } from "#shared/models/db/room/MemberRow";

import { createTable } from "#src/services/shared/overlay/createTable";
import { usersToRoomsInMessage } from "@esposter/db-schema";

// A room's memberships as the overlay holds them: each row projected to the columns a member may read, so no other
// Member's settings reach the overlay. Its key is the user and the room, which is the membership's primary key
export const memberTable = createTable<typeof usersToRoomsInMessage, MemberRow>(usersToRoomsInMessage);
