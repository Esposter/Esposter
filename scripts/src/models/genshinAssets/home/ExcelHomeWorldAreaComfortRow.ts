// The fields read off one row of the game's realm area table: the scene and the area within it, and the load the area holds
// At most. The load is the table's `MMLKIBLLOGP` field, whose name the dump obfuscates: 16,000 in an exterior area and 6,400
// In a room, as the wiki's Load page gives those limits
export interface ExcelHomeWorldAreaComfortRow {
  MMLKIBLLOGP: number;
  areaID: number;
  sceneID: number;
}
