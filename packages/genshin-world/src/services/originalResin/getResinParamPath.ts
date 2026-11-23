import { gameDataLock } from "#src/services/data/gameDataLock";
import { getGameDataObjectPath } from "#src/services/data/getGameDataObjectPath";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where the record of the Original Resin constants is stored in the public genshin assets bucket: its dataset and the hash
// The lock names it under, the same path a reader fetches it from. A server reads the bucket through its binding, which
// Has no url to fetch it from
export const getResinParamPath = (): string => {
  const hash = gameDataLock.objects["stats/resin"];
  if (hash === undefined)
    throw new InvalidOperationError(Operation.Read, "stats/resin", "is not in the game data lock");
  return getGameDataObjectPath("stats", hash);
};
