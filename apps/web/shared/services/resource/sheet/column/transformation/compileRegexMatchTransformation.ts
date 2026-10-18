import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";
import type { RegexMatchTransformation } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";

import { getResult } from "@esposter/shared";

export const compileRegexMatchTransformation: ColumnTransformationCompiler<RegexMatchTransformation> = (
  transformation,
) =>
  getResult(() => new RegExp(transformation.pattern, "u")).match(
    (regex) =>
      ({ readSource }) => {
        const readValue = readSource(transformation.sourceColumnId);
        return (row, rowIndex) => {
          const value = readValue(row, rowIndex);
          if (typeof value !== "string") return null;
          const match = regex.exec(value);
          return match?.[transformation.groupIndex] ?? null;
        };
      },
    () => () => () => null,
  );
