// The fields read off one row of the game's tower schedule: a period's id, the reward group its floors draw from, its sets of
// Floors each with the moment it begins, the moment it closes, and the blessing it gives by its name, its description and its
// Icon. A period has one set, the first, and the rest are empty
export interface ExcelTowerScheduleRow {
  buffnameTextMapHash: number;
  closeTime: string;
  descTextMapHash: number;
  icon: string;
  LHOGNLPBILP: { EFPMEPJHIKD?: number[]; EHNDJIHDENA?: string }[];
  rewardGroup: number;
  scheduleId: number;
}
