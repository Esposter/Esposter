// The columns a table's topics are keyed by: a topic names one row set per value of a scope column (the live topics
// Design). A column whose value is a bearer secret is also listed in `secretColumns`, so the topic it names carries a
// Digest of the value and never the value itself
export interface TableScope<TColumnName extends string> {
  columns: TColumnName[];
  secretColumns?: TColumnName[];
}
