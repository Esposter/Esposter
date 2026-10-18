import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";
import type { MathTransformation } from "#shared/models/resource/sheet/column/transformation/MathTransformation";

import { getResult } from "@esposter/shared";
import { compile } from "mathjs";

// The expression is parsed once here rather than per cell; mathjs's compiled form is the only place it is read
export const compileMathTransformation: ColumnTransformationCompiler<MathTransformation> = (transformation) =>
  getResult(() => compile(transformation.expression)).match(
    (compiledExpression) =>
      ({ readSource }) => {
        const readVariables = transformation.variables.map(({ name, sourceColumnId }) => ({
          name,
          readValue: readSource(sourceColumnId),
        }));
        return (row, rowIndex) => {
          const scope = Object.fromEntries(
            readVariables.map(({ name, readValue }) => {
              const value = readValue(row, rowIndex);
              return [name, value === null ? 0 : Number(value)];
            }),
          );
          return getResult(() => compiledExpression.evaluate(scope)).match(
            (result) => (typeof result === "number" && Number.isFinite(result) ? result : null),
            () => null,
          );
        };
      },
    () => () => null,
  );
