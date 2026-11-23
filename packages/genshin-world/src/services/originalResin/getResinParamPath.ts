import { GameDataKeys } from "#src/generated/gameDataKeys";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { getGameDataObjectPath } from "#src/services/data/getGameDataObjectPath";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where the record of the Original Resin constants is stored in the public genshin assets bucket: under its own key as
// Its dataset, named by the hash the lock holds, the path a reader fetches it from. A server reads the bucket through its
// Binding, which has no url to fetch it from
export const getResinParamPath = (): string => {
  const key = GameDataKeys.stats.resin;
  const hash = gameDataLock.objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return getGameDataObjectPath(key, hash);
};
