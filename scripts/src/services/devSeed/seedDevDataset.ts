import type { SeedDevDatasetInput } from "#src/models/devSeed/SeedDevDatasetInput";
import type { SeedRefusal } from "#src/models/devSeed/SeedRefusal";

import { getSeedRefusal } from "#src/services/devSeed/getSeedRefusal";
import { writeSeedFriends } from "#src/services/devSeed/writeSeedFriends";
import { writeSeedMessages } from "#src/services/devSeed/writeSeedMessages";
import { writeSeedResources } from "#src/services/devSeed/writeSeedResources";
import { writeSeedRoles } from "#src/services/devSeed/writeSeedRoles";
import { writeSeedRooms } from "#src/services/devSeed/writeSeedRooms";
import { writeSeedUsers } from "#src/services/devSeed/writeSeedUsers";

// Writes the dev dataset through the injected stores. Both targets are gated before the first write, so a refused run
// Leaves both stores as they were; every write is keyed by a fixed identifier, so a rerun converges on the same rows
export const seedDevDataset = async ({
  databaseName,
  db,
  messageAscendingClient,
  messageClient,
  storageConnectionString,
}: SeedDevDatasetInput): Promise<SeedRefusal | undefined> => {
  const refusal = getSeedRefusal(databaseName, storageConnectionString);
  if (refusal) return refusal;
  await writeSeedUsers(db);
  await writeSeedFriends(db);
  await writeSeedRooms(db);
  await writeSeedRoles(db);
  await writeSeedResources(db);
  await writeSeedMessages(messageClient, messageAscendingClient);
  return undefined;
};
