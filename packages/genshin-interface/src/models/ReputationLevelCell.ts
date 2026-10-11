import type { RewardItemCell } from "#src/models/RewardItemCell";

// One level a nation's Reputation reward page lists: its level, the items it pays, its unlock line where it opens a
// Feature ("" where it opens none), and whether the nation's Reputation has reached it
export interface ReputationLevelCell {
  isAchieved: boolean;
  items: RewardItemCell[];
  level: number;
  unlockLabel: string;
}
