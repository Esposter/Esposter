export interface ReadSet {
  joins: ReadSetJoin[];
  // The statement levels a read holds: the statement it awaited and each statement nested in it, read apart
  levels: ReadSetLevel[];
  nullChecks: ReadSetColumn[];
  scopes: ReadSetScope[];
  // Every table the levels name, each once
  tables: string[];
}

// A column a read depends on, by its table's database name and its key in the table's definition
export interface ReadSetColumn {
  column: string;
  table: string;
}

export interface ReadSetJoin {
  left: ReadSetKey;
  right: ReadSetKey;
}

// One side of a join. `selectedAs` is the name the read's own select gives the column, when it selects it
export interface ReadSetKey extends ReadSetColumn {
  selectedAs?: string;
}

// The tables one statement level names, and the tables it names by a scope equality of its own. A table named by no
// Equality at its level is read whole there, whatever a nested statement names of it
export interface ReadSetLevel {
  scopedTables: string[];
  tables: string[];
}

// A scope fact: a scope column the read tests against one value, secret when the column is a bearer secret
export interface ReadSetScope extends ReadSetColumn {
  secret?: true;
  value: unknown;
}
