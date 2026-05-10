import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { decompileVariables } from "#shared/services/compiler/decompileVariables";

export const computeStringPatternTransformation = (values: ColumnValue[], pattern: string): string =>
  decompileVariables(pattern, Object.fromEntries(values.map((value, index) => [String(index), value])));
