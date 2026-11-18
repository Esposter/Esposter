import type { JoinKind } from "#src/models/realtime/JoinKind";
import type { JoinSide } from "#src/models/realtime/JoinSide";

export interface ReadSet {
  // The columns a read filters on, other than by a scope equality or a join: a row the filter removes can come back, so a
  // Table filtered this way is read whole
  filters: ReadSetColumn[];
  joins: ReadSetJoin[];
  // The statement levels a read holds: the statement it awaited and each statement nested in it, read apart
  levels: ReadSetLevel[];
  scopes: ReadSetScope[];
  // Every table the levels name, each once
  tables: string[];
}

// A column a read depends on, by its table's database name and its key in the table's definition
export interface ReadSetColumn {
  column: string;
  table: string;
}

// A join's kind, and for a left join the side it null-fills: the side a row of the other side may come without a match
export interface ReadSetJoin {
  kind: JoinKind;
  left: ReadSetKey;
  nullFilled?: JoinSide;
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
