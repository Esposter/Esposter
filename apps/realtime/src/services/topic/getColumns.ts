import type { StoredColumns } from "#src/models/topic/StoredColumns";

// The columns a stored entry names, where an absent one names every column
export const getColumns = (stored: StoredColumns | undefined): string[] | undefined => stored ?? undefined;
