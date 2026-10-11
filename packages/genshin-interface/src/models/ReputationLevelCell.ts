// One level a nation's Reputation reward page lists: its level as the game words it, how many items it pays and that
// Count's words for assistive technology, its unlock line where it opens a feature, and whether the nation's Reputation
// Has reached it
export interface ReputationLevelCell {
  id: number;
  isAchieved: boolean;
  itemCount: number;
  itemCountLabel: string;
  levelLabel: string;
  statusLabel: string;
  unlockLabel: string;
}
