import type { Clause } from "@esposter/db-schema";

import { serializeClausesCore } from "@/services/azure/transformer/serializeClausesCore";

// Serializes clauses for an Azure Table Storage OData filter: Date comparisons emit datetime'<iso>' literals.
export const serializeClauses = (clauses: Clause<Record<string, unknown>>[]): string =>
  serializeClausesCore(clauses, true);
