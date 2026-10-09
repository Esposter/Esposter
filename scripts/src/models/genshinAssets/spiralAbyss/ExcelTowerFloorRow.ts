// The fields read off one row of the game's tower floor table: a floor's id and its place in the twelve, the level group
// Its three chambers are listed under, its teams, and the stars that open the floor above
export interface ExcelTowerFloorRow {
  floorId: number;
  floorIndex: number;
  levelGroupId: number;
  teamNum: number;
  unlockStarCount: number;
}
