// A scope value a row or a read holds: the value of one scope column of one table
export interface ScopeValue {
  column: string;
  table: string;
  value: unknown;
}
