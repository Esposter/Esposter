import type { Database } from "@esposter/db-schema";

import { SEED_DATE } from "#src/services/devSeed/constants";
import { resourcesInResource, ResourceType } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";

// One note the driven user owns
export const writeSeedResources = async (db: Database): Promise<void> => {
  await db
    .insert(resourcesInResource)
    .values({
      createdAt: SEED_DATE,
      id: ZERO_UUID,
      name: "name",
      type: ResourceType.Note,
      updatedAt: SEED_DATE,
      userId: DRIVEN_USER_ID,
    })
    .onConflictDoNothing();
};
