import { GameDataKeys } from "#src/generated/gameDataKeys";
import { getGameDataRecord } from "#src/services/data/getGameDataRecord";
import { getHostedAssetPath } from "hosted-assets";

// Where the record of the Original Resin constants is stored in the public genshin assets bucket: under its own key,
// Named by the hash the lock holds. A server reads the bucket through its binding, which has no url to fetch it from
export const getResinParamPath = (): string => getHostedAssetPath(getGameDataRecord(GameDataKeys.stats.resin));
