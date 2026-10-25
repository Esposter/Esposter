export interface BaseUiDataTableColumn<T> {
  // How a table that sorts its own rows orders two of them by this column, where its text would order them wrongly: a
  // Currency's 9 before its 10
  compare?: (firstItem: T, secondItem: T) => number;
  // What a cell shows when the call site draws nothing of its own there
  getValue?: (item: T) => string;
  title: string;
}
