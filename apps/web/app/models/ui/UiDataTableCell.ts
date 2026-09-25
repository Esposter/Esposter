// One cell of a data table: the row it is in, by the item's id, and its column, by the column's key
export interface UiDataTableCell {
  columnKey: string;
  itemId: string;
}
