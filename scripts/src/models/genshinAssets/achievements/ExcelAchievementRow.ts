// The fields read off one row of the game's achievement table: its id, its category, its order, the trigger that counts it
// Toward its count, the tier before it, its reward, its title and description by text id, whether it is shown before it is
// Done, and whether the game no longer offers it. A trigger's parameters are its slots, each a list of ids joined by
// Commas or semicolons
export interface ExcelAchievementRow {
  descTextMapHash: number;
  finishRewardId: number;
  goalId: number;
  id: number;
  isDisuse: boolean;
  isShow: string;
  orderId: number;
  preStageAchievementId: number;
  progress: number;
  titleTextMapHash: number;
  triggerConfig: { paramList: string[]; triggerType: string };
}
