// One row of the game's dungeon table: a level of some kind, the recommended Adventure Rank it is set at, the enemies'
// Level it fights at, the reward preview a clear of it gives, and the resin claiming its tree costs
export interface ExcelDungeonRow {
  id: number;
  // The level configs a daily fight names, keyed by their entity id: one ley line disorder for a domain's level
  levelConfigMap?: Record<string, number>;
  levelRevise: number;
  limitLevel: number;
  passRewardPreviewID: number;
  statueCostCount: number;
  subType?: string;
  type: string;
}
