// What a capped dataset read left behind — only ever produced when the provider knew the uncapped count.
// `isCountCapped` marks a totalRows that is a floor from a bounded count, not an exact total
export interface DatasetTruncation {
  hiddenRows: number;
  isCountCapped: boolean;
  // Empty for a read that only lost rows; naming a column means its values are a floor, not a total
  partialColumns: string[];
  shownRows: number;
  totalRows: number;
}
