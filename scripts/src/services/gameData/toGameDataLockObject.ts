import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { HostedAssetObject } from "hosted-assets";

import { getGameDataObjectName } from "genshin-world";

// A record's lock entry: named by its sha256, and sized by the UTF-8 bytes of the JSON that hash names
export const toGameDataLockObject = (record: GameDataRecord): HostedAssetObject => ({
  bytes: Buffer.byteLength(record.json),
  ...getGameDataObjectName(record.dataset, record.hash),
});
