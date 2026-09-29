import type { ProcedureNode } from "#src/runtime/client/models/ProcedureNode";

import { getProcedureKey } from "#src/runtime/client/services/getProcedureKey";

// The key `useMutation` keeps a procedure's last result under
export const getMutationKey = (procedure: ProcedureNode): string => getProcedureKey(procedure._def().path.join("."));
