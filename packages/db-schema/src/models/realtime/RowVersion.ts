// A tracked row a write changed, named by its table and its primary key's fields, the fields the overlay holds the row
// By, with the version the write left it at. Each key value is typed as the row holds it, so a number key stays
// A number. A mutation's answer names one for each such row
export interface RowVersion {
  key: Record<string, number | string>;
  table: string;
  version: number;
}
