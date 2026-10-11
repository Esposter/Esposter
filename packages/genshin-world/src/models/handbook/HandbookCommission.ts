import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { GameTextKey } from "genshin-text";

export interface HandbookCommission {
  progress: number;
  rewards: HandbookReward[];
  titleKey: GameTextKey;
  total: number;
}
