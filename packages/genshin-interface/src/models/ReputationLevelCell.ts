// One level a nation's Reputation reward page lists: its level as the game words it, how many items it pays, its unlock
// Line where it opens a feature, and whether the nation's Reputation has reached it
export interface ReputationLevelCell {
  id: number;
  isAchieved: boolean;
  itemCount: number;
  levelLabel: string;
  statusLabel: string;
  unlockLabel: string;
}
