// One row of the game's forge random table: the id a forge row's drop names, and the items one unit may yield, each with
// Its count and its weight among the items. A slot the table leaves empty is read with every field at zero, an item id
// Of zero naming no item
export interface ExcelForgeRandomRow {
  forgeRandomId: number;
  mainRandomItems: { count: number; itemId: number; weight: number }[];
}
