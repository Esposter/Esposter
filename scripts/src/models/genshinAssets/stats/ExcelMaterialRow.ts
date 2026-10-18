// An item of the game's material table, of which only its uses are read: each use an operation with its parameters, the
// Operation left out where it is none, the first of its enum
export interface ExcelMaterialRow {
  id: number;
  itemUse: { useOp?: string; useParam: string[] }[];
}
