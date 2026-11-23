// One lift past a level cap of the game's extra-level table: the level it lifts from and to, and the items it takes
export interface ExcelAvatarExtraLevelRow {
  costItems: { count: number; id: number }[];
  fromLevel: number;
  level: number;
}
