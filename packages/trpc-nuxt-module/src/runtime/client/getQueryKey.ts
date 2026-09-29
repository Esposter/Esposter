import type { ProcedureNode } from "#src/runtime/client/models/ProcedureNode";

import { getProcedureKey } from "#src/runtime/client/services/getProcedureKey";

// The key `useQuery` caches a procedure's data under for this input, for `useNuxtData` and `refreshNuxtData`
export const getQueryKey = (procedure: ProcedureNode, input?: unknown): string =>
  getProcedureKey(procedure._def().path.join("."), input);
