// The fields read off one row of the game's realm area table: the scene and the area within it, the load the area holds
// At most, its type, and the two loads its meter turns orange and red at. The load is the table's `MMLKIBLLOGP` field,
// Whose name the dump obfuscates: 16,000 in an exterior area and 6,400 in a room, as the wiki's Load page gives those
// Limits. An exterior area's `areaType` is `ExteriorArea`. `highLoadLimit` is the orange threshold and `lowLoadLimit` the red
export interface ExcelHomeWorldAreaComfortRow {
  MMLKIBLLOGP: number;
  areaID: number;
  areaType?: string;
  highLoadLimit: number;
  lowLoadLimit: number;
  sceneID: number;
}
