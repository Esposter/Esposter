import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A mapped row in the table's column order, which the upsert takes by position.
// A column the mapper left out is refused rather than written as a default
export const toRowArray = (table: CoreTable, values: Record<string, D1Value>): D1Value[] =>
  table.columns.map(({ name }) => {
    const value = values[name];
    if (value === undefined)
      throw new InvalidOperationError(Operation.Create, table.name, `has no mapped value for ${name}`);
    return value;
  });
