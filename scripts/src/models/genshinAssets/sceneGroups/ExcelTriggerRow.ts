// The fields read off one row of the game's trigger table: the trigger's id, which a quest's step fires, and the scene and
// Group that hold it
export interface ExcelTriggerRow {
  groupId: number;
  id: number;
  sceneId: number;
}
