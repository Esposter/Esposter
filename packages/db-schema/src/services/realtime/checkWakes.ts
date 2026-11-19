// Whether a publish reaches a watch of the same topic. A row-set change reaches every watch, and a watch of every column
// Hears any publish, so otherwise the publish must change a column the watch reads
export const checkWakes = (watchColumns: string[] | undefined, publishColumns: string[] | undefined): boolean =>
  watchColumns === undefined ||
  publishColumns === undefined ||
  watchColumns.some((column) => publishColumns.includes(column));
