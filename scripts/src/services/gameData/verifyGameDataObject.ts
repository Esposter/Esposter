import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation, readFileResponse } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { getGameDataObjectName } from "genshin-world";
import { getHostedAssetUrl } from "hosted-assets";

// Fetches one object anonymously from a bucket's base and checks that the bytes it serves hash to the name the lock
// Gave it. The bytes are hashed as served and never re-serialised, so a body that parses to the named value but is
// Other bytes is refused
export const verifyGameDataObject = async (baseUrl: string, { dataset, hash }: GameDataObjectRef): Promise<unknown> => {
  const url = getHostedAssetUrl(baseUrl, getGameDataObjectName(dataset, hash));
  const bytes = Buffer.from(await (await readFileResponse(url, FETCH_TIMEOUT_MS)).arrayBuffer());
  if (getContentAddress(bytes) !== hash)
    throw new InvalidOperationError(Operation.Read, url, "does not hash to its name");
  return parseMachineJson(bytes.toString("utf8"));
};
