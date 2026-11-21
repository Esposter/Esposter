import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// The overlay tables a write involves, as a tuple so each table keeps its own row type. A list of tables of differing rows
// Has no single row type its members all fit, so the tuple is what lets one list hold them
export type TablesOf<TRows extends Versioned[]> = { [I in keyof TRows]: Table<TRows[I]> };
