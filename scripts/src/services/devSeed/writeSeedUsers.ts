import type { Database } from "@esposter/db-schema";

import { SEED_DATE, SEED_FRIEND_USER_ID } from "#src/services/devSeed/constants";
import { usersInAuth } from "@esposter/db-schema";
import { DRIVEN_USER_ID } from "@esposter/shared";

// The driven user the session route signs in, and the one friend beside it. Keyed by id, so a second run finds both rows
export const writeSeedUsers = async (db: Database): Promise<void> => {
  await db
    .insert(usersInAuth)
    .values([
      {
        createdAt: SEED_DATE,
        email: "email",
        emailVerified: true,
        id: DRIVEN_USER_ID,
        name: "name",
        updatedAt: SEED_DATE,
      },
      {
        createdAt: SEED_DATE,
        email: "",
        emailVerified: true,
        id: SEED_FRIEND_USER_ID,
        name: "name",
        updatedAt: SEED_DATE,
      },
    ])
    .onConflictDoNothing();
};
