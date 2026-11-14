import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readJson } from "genshin-world";

// Fetches one object anonymously from a bucket's base and checks that its content hashes to the name the lock gave it
export const verifyGameDataObject = async (baseUrl: string, { dataset, hash }: GameDataObjectRef): Promise<unknown> => {
  const url = `${baseUrl}/${getGameDataObjectKey(dataset, hash)}`;
  const json = await readJson(url);
  if (getGameDataHash(JSON.stringify(json)) !== hash)
    throw new InvalidOperationError(Operation.Read, url, "does not hash to its name");
  return json;
};
