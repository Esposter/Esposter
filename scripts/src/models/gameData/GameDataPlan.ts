import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { GameDataLock } from "genshin-world";

// The lock a publication names and every record that lock reaches, each record once
export interface GameDataPlan {
  lock: GameDataLock;
  records: GameDataRecord[];
}
