// One row of the game's dungeon table: a level of some kind, the recommended Adventure Rank it is set at, the enemies'
// Level it fights at, and the reward preview a clear of it gives
export interface ExcelDungeonRow {
  id: number;
  levelRevise: number;
  limitLevel: number;
  passRewardPreviewID: number;
  subType?: string;
  type: string;
}
