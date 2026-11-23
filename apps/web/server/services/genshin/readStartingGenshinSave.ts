import type { GenshinSave } from "genshin-world/save";

import { getBucket } from "#server/services/storage/getBucket";
import { readJsonBlob } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { createStartingGenshinSave, getResinParamPath, resinParamSchema } from "genshin-world/save";

// A new player's save, its Original Resin at the cap the game's record gives. The server has no url to fetch the record
// From, so it reads the shared hosted bucket through its binding, and the record is decompressed as it is stored
export const readStartingGenshinSave = async (): Promise<GenshinSave> => {
  const blob = await readJsonBlob(getBucket(StorageBucket.PublicHostedAssets), getResinParamPath());
  if (!blob) throw new InvalidOperationError(Operation.Read, getResinParamPath(), "is not stored in the game data");
  return createStartingGenshinSave(resinParamSchema.parse(jsonDateParse(blob.toString("utf8"))));
};
