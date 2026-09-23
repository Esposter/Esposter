interface BaseUiDataTableColumn<T> {
  // What a cell shows when the call site draws nothing of its own there
  getValue?: (item: T) => string;
  title: string;
}

// One column of a data table: the header it reads as and what its cells show. A column its header sorts by is keyed
// By what the server sorts on, so the order a header sets is one the server takes; any other column is keyed freely
export type UiDataTableColumn<T, TSortKey extends string = string> =
  | (BaseUiDataTableColumn<T> & { isSortable: false; key: string })
  | (BaseUiDataTableColumn<T> & { isSortable?: true; key: TSortKey });
