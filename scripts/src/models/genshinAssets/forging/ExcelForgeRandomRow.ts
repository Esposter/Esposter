// One row of the game's forge random table: the id a forge row's drop names, and the items one unit may yield, each with
// Its count and its weight among the items. A slot the table leaves empty has no item, and is read as none
export interface ExcelForgeRandomRow {
  forgeRandomId: number;
  mainRandomItems: Partial<{ count: number; itemId: number; weight: number }>[];
}
