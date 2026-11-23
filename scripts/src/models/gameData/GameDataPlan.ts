import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { HostedAssetLock } from "hosted-assets";

// The lock a publication names and every record that lock reaches, each record once
export interface GameDataPlan {
  lock: HostedAssetLock;
  records: GameDataRecord[];
}
