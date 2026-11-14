import type { CoreTable } from "#src/models/cutover/CoreTable";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The typed table a mapper names, from the D1 schema the copy writes into
export const getMapperCoreTable = (name: string): CoreTable => {
  const coreTable = getCoreTables().find((table) => table.name === name);
  if (!coreTable) throw new InvalidOperationError(Operation.Read, name, "is not a table of the D1 schema");
  return coreTable;
};
