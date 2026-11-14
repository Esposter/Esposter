// A row as verify compares it: its primary key in key order, and its values as the canonical JSON both sides produce
export interface KeyedCanonicalRow {
  canonical: string;
  key: unknown[];
}
