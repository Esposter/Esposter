import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";
import type { MathTransformation } from "#shared/models/resource/sheet/column/transformation/MathTransformation";

import { compileMathExpression, parseMathExpression } from "math-expression-compiler";

// The expression is parsed and compiled once here rather than per cell, so a row runs only its arithmetic. A formula the
// Parser refuses reads empty, as does any answer that is not a finite number
export const compileMathTransformation: ColumnTransformationCompiler<MathTransformation> = (transformation) =>
  parseMathExpression(transformation.expression).match(
    (node) => {
      const evaluate = compileMathExpression(
        node,
        transformation.variables.map(({ name }) => name),
      );
      return ({ readSource }) => {
        const readValues = transformation.variables.map(({ sourceColumnId }) => readSource(sourceColumnId));
        // One array serves every row, since the compiled function reads its values synchronously and keeps none of them
        const values = readValues.map(() => 0);
        return (row, rowIndex) => {
          for (const [index, readValue] of readValues.entries()) {
            const value = readValue(row, rowIndex);
            values[index] = value === null ? 0 : Number(value);
          }
          const result = evaluate(values);
          return Number.isFinite(result) ? result : null;
        };
      };
    },
    () => () => () => null,
  );
