import type { SearchClause } from "#src/models/search/SearchClause";

import { serializeClausesCore } from "#src/services/transformer/serializeClausesCore";

// Serializes clauses for an Azure Search filter
export const serializeSearchClauses = (clauses: SearchClause<Record<string, unknown>>[]): string =>
  serializeClausesCore(clauses);
