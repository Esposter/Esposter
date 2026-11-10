import type { Database } from "@esposter/db-schema";

import { SEED_DATE } from "#src/services/devSeed/constants";
import { roomsInMessage, RoomType, usersToRoomsInMessage } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";

// One room the driven user owns and is the one member of
export const writeSeedRooms = async (db: Database): Promise<void> => {
  await db
    .insert(roomsInMessage)
    .values({
      createdAt: SEED_DATE,
      id: ZERO_UUID,
      name: "name",
      type: RoomType.Room,
      updatedAt: SEED_DATE,
      userId: DRIVEN_USER_ID,
    })
    .onConflictDoNothing();
  await db.insert(usersToRoomsInMessage).values({ roomId: ZERO_UUID, userId: DRIVEN_USER_ID }).onConflictDoNothing();
};
