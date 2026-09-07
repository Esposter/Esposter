import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { MathTransformation } from "#shared/models/resource/sheet/column/transformation/MathTransformation";

import { getResult } from "@esposter/shared";
import { evaluate } from "mathjs";

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
  return getResult(() => evaluate(transformation.expression, scope)).match(
    (result) => (typeof result === "number" && Number.isFinite(result) ? result : null),
    () => null,
  );
};
