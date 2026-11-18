export interface ReadSet {
  joins: ReadSetJoin[];
  nullChecks: ReadSetColumn[];
  scopes: ReadSetScope[];
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

// A scope fact: a scope column the read tests against one value, secret when the column is a bearer secret
export interface ReadSetScope extends ReadSetColumn {
  secret?: true;
  value: unknown;
}
