import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { SAVE_GAME_BUCKETS } from "#src/services/user/constants";
import { readJsonBlob } from "@esposter/db";
import { getSaveBlobName } from "@esposter/db-schema";

// Each game's save for the person, as the JSON its blob holds. A game the person never saved in has no entry
export const writeSaveEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const saves = await Promise.all(
    Object.entries(SAVE_GAME_BUCKETS).map(async ([game, storageBucket]) => {
      const bucket = getBucket(storageBucket);
      return { game, save: await readJsonBlob(bucket, getSaveBlobName(userId)) };
    }),
  );
  // @TODO: https://github.com/oxc-project/oxc/issues/30134 — no-await-in-loop skips a loop whose body is a bare `if`.
  // Until the rule reports this loop, no directive stands here; the comment below becomes its reason then.
  // Order is the contract: the archive takes one entry at a time, so its entries stay in order
  for (const { game, save } of saves) if (save) await archive.addEntry(`saves/${game}/save.json`, save);
};
