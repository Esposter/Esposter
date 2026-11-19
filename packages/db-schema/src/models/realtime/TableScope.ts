// The columns a table's topics are keyed by: a topic names one row set per value of a scope column (the live topics
// Design). A column whose value is a bearer secret is one of `columns` and is also listed in `secretColumns`, so the topic it
// Names carries a digest of the value and never the value itself. Every secret column is a scope column, so `columns` alone
// Says which columns scope a read
export interface TableScope<TColumnName extends string> {
  columns: TColumnName[];
  secretColumns?: TColumnName[];
}
