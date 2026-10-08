// One level of a nation's Reputation: its number, the EXP it needs to reach the next (zero at a nation's last level), the
// Reward it pays, the unlock functions and shop goods it opens, and the request group its keeper offers from it
export interface ExcelReputationLevelRow {
  cityId: number;
  functionId: number;
  goodsId: number;
  level: number;
  nextLevelExp: number;
  requestGroupId: number;
  rewardId: number;
}
