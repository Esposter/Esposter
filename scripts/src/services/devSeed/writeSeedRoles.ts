import type { Database } from "@esposter/db-schema";

import { roomRolesInMessage } from "@esposter/db-schema";
import { ZERO_UUID } from "@esposter/shared";

// The room's everyone role, the one every member holds
export const writeSeedRoles = async (db: Database): Promise<void> => {
  await db
    .insert(roomRolesInMessage)
    .values({ id: ZERO_UUID, isEveryone: true, name: "name", roomId: ZERO_UUID })
    .onConflictDoNothing();
};
