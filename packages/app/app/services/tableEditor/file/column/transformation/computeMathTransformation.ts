import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { MathTransformation } from "#shared/models/tableEditor/file/column/transformation/MathTransformation";

import { evaluate } from "mathjs";
import { fromThrowable } from "neverthrow";

export const computeMathTransformation = (
  transformation: MathTransformation,
  computeSource: (sourceColumnId: string) => ColumnValue,
): ColumnValue => {
  const scope = Object.fromEntries(
    transformation.variables.map(({ name, sourceColumnId }) => {
      const value = computeSource(sourceColumnId);
      return [name, value === null ? 0 : Number(value)];
    }),
  );
  return fromThrowable((): unknown => evaluate(transformation.expression, scope))().match(
    (result) => (typeof result === "number" && isFinite(result) ? result : null),
    () => null,
  );
};
