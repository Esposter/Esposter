import type { Clause } from "@esposter/azure";

import { serializeClausesCore } from "#src/services/azure/transformer/serializeClausesCore";

// Serializes clauses for an Azure Search filter: Date comparisons emit the bare ISO string.
export const serializeSearchClauses = (clauses: Clause<Record<string, unknown>>[]): string =>
  serializeClausesCore(clauses, false);
