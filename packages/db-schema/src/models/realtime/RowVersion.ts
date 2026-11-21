// A tracked row a write changed, named by its table and its primary key's fields, the fields the overlay holds the row by, with
// The version the write left it at. A mutation's answer names one for each such row
export interface RowVersion {
  key: Record<string, string>;
  table: string;
  version: number;
}
