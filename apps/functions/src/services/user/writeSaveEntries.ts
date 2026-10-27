import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { SAVE_GAME_CONTAINERS } from "#src/services/user/constants";
import { readJsonBlob } from "@esposter/db";
import { getSaveBlobName } from "@esposter/db-schema";

// Each game's save for the person, as the JSON its blob holds. A game the person never saved in has no entry
export const writeSaveEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  for (const [game, containerName] of Object.entries(SAVE_GAME_CONTAINERS)) {
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one game at a time
    const save = await readJsonBlob(await getContainerClient(containerName), getSaveBlobName(userId));
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    if (save) await archive.addEntry(`saves/${game}/save.json`, save);
  }
};
