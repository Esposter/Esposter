// Each row of one table read under the decoded names its key map gives, each field taken from the dump's own key for it,
// So a reader names a field by what it means while the dump keeps its scrambled key. A key the map leaves out is dropped
export const renameDumpKeys = <TRow>(rows: Record<string, unknown>[], keyMap: Record<keyof TRow, string>): TRow[] =>
  rows.map((row) =>
    Object.fromEntries(Object.entries<string>(keyMap).map(([field, dumpKey]) => [field, row[dumpKey]])),
  ) as TRow[];
