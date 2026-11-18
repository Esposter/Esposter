import type { Table } from "drizzle-orm";

import { getTableScope } from "@esposter/db-schema";

// The keys of a table's scope columns, secret ones included, each once: the keys a topic names a row by
export const getScopeKeys = (table: Table): string[] => {
  const scope = getTableScope(table);
  return [...new Set([...(scope?.columns ?? []), ...(scope?.secretColumns ?? [])])];
};
