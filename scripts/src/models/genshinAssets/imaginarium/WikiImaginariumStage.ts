// One stage of a season's wiki page: the act and battle it sits under, the variant of that battle's domain enemies
// Block it Is, the level its Easy Mode fights at, and the names of its enemies as the wiki writes them, before any join
// To the game
export interface WikiImaginariumStage {
  act: string;
  battle: string;
  easyLevel: number;
  enemyNames: string[];
  variant: number;
}
