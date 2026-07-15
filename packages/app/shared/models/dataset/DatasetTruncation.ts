// What a capped dataset read left behind — only ever produced when the provider knew the uncapped count
export interface DatasetTruncation {
  hiddenRows: number;
  shownRows: number;
  totalRows: number;
}
