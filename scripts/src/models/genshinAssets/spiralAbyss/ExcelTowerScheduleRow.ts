// The fields read off one row of the game's tower schedule: a period's id, the reward group its floors draw from, and its
// Sets of floors, each with the moment it begins. A period has one set, the first, and the rest are empty
export interface ExcelTowerScheduleRow {
  LHOGNLPBILP: { EFPMEPJHIKD?: number[]; EHNDJIHDENA?: string }[];
  rewardGroup: number;
  scheduleId: number;
}
