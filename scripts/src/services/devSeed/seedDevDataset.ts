import type { SeedDevDatasetInput } from "#src/models/devSeed/SeedDevDatasetInput";

import { writeSeedFriends } from "#src/services/devSeed/writeSeedFriends";
import { writeSeedMessages } from "#src/services/devSeed/writeSeedMessages";
import { writeSeedResources } from "#src/services/devSeed/writeSeedResources";
import { writeSeedRoles } from "#src/services/devSeed/writeSeedRoles";
import { writeSeedRooms } from "#src/services/devSeed/writeSeedRooms";
import { writeSeedUsers } from "#src/services/devSeed/writeSeedUsers";

// Writes the dev dataset through the injected database and message client. Every write is keyed by a fixed identifier,
// So a rerun converges on the same rows
export const seedDevDataset = async ({ db, messageClient }: SeedDevDatasetInput): Promise<void> => {
  await writeSeedUsers(db);
  await writeSeedFriends(db);
  await writeSeedRooms(db);
  await writeSeedRoles(db);
  await writeSeedResources(db);
  await writeSeedMessages(messageClient);
};
