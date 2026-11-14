import type { SeedDevDatasetInput } from "#src/models/devSeed/SeedDevDatasetInput";

import { writeSeedFriends } from "#src/services/devSeed/writeSeedFriends";
import { writeSeedResources } from "#src/services/devSeed/writeSeedResources";
import { writeSeedRoles } from "#src/services/devSeed/writeSeedRoles";
import { writeSeedRooms } from "#src/services/devSeed/writeSeedRooms";
import { writeSeedUsers } from "#src/services/devSeed/writeSeedUsers";

// Writes the dev dataset through the injected database. Every write is keyed by a fixed identifier, so a rerun converges
// On the same rows. The rooms' messages are not seeded: a room's messages live in its own object, which a script cannot
// Reach, so the dataset has rooms with no messages in them
export const seedDevDataset = async ({ db }: SeedDevDatasetInput): Promise<void> => {
  await writeSeedUsers(db);
  await writeSeedFriends(db);
  await writeSeedRooms(db);
  await writeSeedRoles(db);
  await writeSeedResources(db);
};
