// A field the row holds, so reading it by its name is a read of that field of the row
export const checkIsRowField = <TRow extends object>(row: TRow, fieldName: string): fieldName is keyof TRow & string =>
  fieldName in row;
