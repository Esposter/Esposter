// One row of the game's dungeon entry table: the entrance it is, its scene, the point it stands at and the kind of
// Entry it is, a type the domains name by its own string
export interface ExcelDungeonEntryRow {
  // The materials a Domain of Forgery or Mastery gives, one list per pair of days in the order Monday and Thursday,
  // Tuesday and Friday, Wednesday and Saturday, then the union of all three for Sunday
  descriptionCycleRewardList: number[][];
  dungeonEntryId: number;
  id: number;
  sceneId: number;
  type: string;
}
