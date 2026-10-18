import { ROW_PREFIX } from "#src/services/genshinParity/passes/constants";

// The pass a report row names in its first cell
export const getRowPass = (row: string): string => row.slice(ROW_PREFIX.length, row.indexOf(" |", ROW_PREFIX.length));
