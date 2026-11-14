import type { CoreColumn } from "#src/models/cutover/CoreColumn";

// A table of the `core` D1 database, with the Postgres table it is copied from. Its SQLite name is `<schema>_<table>`, so the
// two halves of the name are the Postgres schema and table, and the name is split once, where the schema is read
export interface CoreTable {
  columns: CoreColumn[];
  // The SQLite name, `<schema>_<table>`
  name: string;
  // The SQLite names of the tables this one references, which the copy order must put first
  foreignTableNames: string[];
  // The Postgres schema, the prefix of the SQLite name
  pgSchema: string;
  // The Postgres table, the rest of the SQLite name
  pgTable: string;
  // The primary key in key order
  primaryKeyColumns: CoreColumn[];
  // Each unique index or constraint over a timestamp column, whose uniqueness can break at millisecond precision
  timestampUniqueColumnGroups: CoreColumn[][];
}
