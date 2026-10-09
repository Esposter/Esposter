// One request a Reputation keeper offers, by its request group: the world quest it runs as, its reward and how often it
// Is drawn against the others of its group
export interface ExcelReputationRequestRow {
  groupId: number;
  questId: number;
  requestId: number;
  rewardId: number;
  weight: number;
}
