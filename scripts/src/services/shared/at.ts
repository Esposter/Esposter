export const at = (rows: readonly number[][], row: number, column: number): number => rows[row]?.[column] ?? 0;
