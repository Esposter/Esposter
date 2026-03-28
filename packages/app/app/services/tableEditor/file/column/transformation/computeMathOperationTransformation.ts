import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { MathOperationTransformation } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";

import { evaluate } from "mathjs";

export const computeMathOperationTransformation = (
  transformation: MathOperationTransformation,
  computeSource: (sourceColumnId: string) => ColumnValue,
): ColumnValue => {
  const scope = Object.fromEntries(
    transformation.variables.map(({ name, sourceColumnId }) => {
      const value = computeSource(sourceColumnId);
      return [name, value === null ? 0 : Number(value)];
    }),
  );
  try {
    const result: unknown = evaluate(transformation.expression, scope);
    return typeof result === "number" && isFinite(result) ? result : null;
  } catch {
    return null;
  }
};
