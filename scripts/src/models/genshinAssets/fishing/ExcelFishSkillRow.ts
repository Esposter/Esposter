// One fish skill of the game's skill table: its kind and category, the force it puts on the line and how long it lasts,
// Its parameters, and the bonuses it adds to the reel's zone
export interface ExcelFishSkillRow {
  bonusDuration: number[];
  bonusOffset: number[];
  bonusSpeed: number[];
  bonusWidth: number[];
  duration: number;
  forceFactor: number;
  id: number;
  param: number[];
  priority: number;
  skillCategory: string;
  skillType: string;
}
