// A tracked row a write changed, named by its table and its scope values (a secret's value by its digest, as its topic names
// It), with the version the write left it at. A mutation's answer names one for each such row
export interface RowVersion {
  key: Record<string, string>;
  table: string;
  version: number;
}
