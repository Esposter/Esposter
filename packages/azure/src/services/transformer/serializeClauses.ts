import type { Clause } from "#src/models/Clause";

import { serializeClausesCore } from "#src/services/transformer/serializeClausesCore";

// Serializes clauses for an Azure Table Storage OData filter: Date comparisons emit datetime'<iso>' literals.
export const serializeClauses = (clauses: Clause<Record<string, unknown>>[]): string =>
  serializeClausesCore(clauses, true);
