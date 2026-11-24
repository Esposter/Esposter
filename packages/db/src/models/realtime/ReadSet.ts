import type { FilterSite } from "#src/models/realtime/FilterSite";
import type { JoinKind } from "#src/models/realtime/JoinKind";
import type { JoinSide } from "#src/models/realtime/JoinSide";

export interface ReadSet {
  // The columns a read filters on, other than by a scope equality or a join: a row the filter removes can come back, so
  // A table filtered this way is read whole, unless the filter sits in a left join's ON clause on the table the join
  // Brings
  filters: ReadSetFilter[];
  joins: ReadSetJoin[];
  // The statement levels a read holds: the statement it awaited and each statement nested in it, read apart
  levels: ReadSetLevel[];
  occurrences: ReadSetOccurrence[];
  scopes: ReadSetScope[];
  // Every table the levels name, each once
  tables: string[];
}

// A column a read depends on, by its table's database name and its key in the table's definition
export interface ReadSetColumn {
  column: string;
  table: string;
}

// A column a read tests by a condition other than a scope equality or a join, the clause the condition sits in, and the
// Occurrence of the table it tests, and the statement level it sits in: the alias or name the statement gives that
// Table where the condition reads it, and the level the walk opened for that condition
export interface ReadSetFilter extends ReadSetColumn {
  level: number;
  occurrence: string;
  site: FilterSite;
}

// A join's kind, and for a left join the side it null-fills: the side a row of the other side may come without a match
export interface ReadSetJoin {
  kind: JoinKind;
  left: ReadSetKey;
  nullFilled?: JoinSide;
  right: ReadSetKey;
}

// One side of a join. `selectedAs` is the name the read's own select gives the column, when it selects it. `occurrence`
// Is The table occurrence the side reads, and the statement level it is read in, so an occurrence of a table is named
// Apart from Another occurrence of it. The level is -1 for a subquery's selected column, whose own level the walk has
// Not opened, so no Declared occurrence holds it and the side is never named by its rows
export interface ReadSetKey extends ReadSetColumn {
  level: number;
  occurrence: string;
  selectedAs?: string;
}

// The tables one statement level declares, each once. The occurrences the statement declares, and their levels, are
// Listed in `occurrences`, so a level's tables are read there and not here by scope
export interface ReadSetLevel {
  tables: string[];
}

// A table occurrence the statement declares: the alias or name it gives the table, the table, the statement level it is
// Declared In, and whether an equality of its own at that level scopes it. Two occurrences of one table are named
// Apart, so a table is Table-wide when any of its occurrences is neither scoped nor named by its rows
export interface ReadSetOccurrence {
  isScoped: boolean;
  level: number;
  occurrence: string;
  table: string;
}

// A scope fact: a scope column the read tests against one value, secret when the column is a bearer secret
export interface ReadSetScope extends ReadSetColumn {
  isSecret?: true;
  value: unknown;
}
