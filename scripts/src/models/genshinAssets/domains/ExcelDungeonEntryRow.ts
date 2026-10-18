// One row of the game's dungeon entry table: the entrance it is, its scene, the point it stands at and the kind of
// Entry it is, a type the domains name by its own string
export interface ExcelDungeonEntryRow {
  dungeonEntryId: number;
  id: number;
  sceneId: number;
  type: string;
}
