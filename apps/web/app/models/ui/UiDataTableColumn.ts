// One column of a data table: its key, the header it reads as, whether its header sorts by it, and what a cell shows
// When the call site draws nothing of its own there
export interface UiDataTableColumn<T> {
  getValue?: (item: T) => string;
  isSortable?: false;
  key: string;
  title: string;
}
