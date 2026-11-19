import type { AnyColumn } from "drizzle-orm";

// The columns of a table an allowlist names, for a SELECT or RETURNING's fields. The allowlist is the one a relational
// Read takes, so a write answers with the same columns a read does, and a column left out of it is withheld from both.
// The keys are known only at runtime, so the compiler sees the built object as a bare Record that overlaps no per-key
// Pick; the cast states the pick the allowlist makes over the table's own columns
export const pickColumns = <TColumns extends Record<string, AnyColumn>, TKey extends keyof TColumns & string>(
  columns: TColumns,
  allowlist: Record<TKey, true>,
): Pick<TColumns, TKey> => {
  const keys = Object.keys(columns).filter((key): key is TKey => Object.hasOwn(allowlist, key));
  return Object.fromEntries(keys.map((key) => [key, columns[key]])) as Pick<TColumns, TKey>;
};
