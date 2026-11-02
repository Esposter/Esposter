import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";
import type { RegexMatchTransformation } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";

import { compileRegexMatchPattern } from "#shared/services/resource/sheet/column/transformation/compileRegexMatchPattern";

export const compileRegexMatchTransformation: ColumnTransformationCompiler<RegexMatchTransformation> = (
  transformation,
) =>
  compileRegexMatchPattern(transformation.pattern).match(
    (regex) =>
      ({ readSource }) => {
        const readValue = readSource(transformation.sourceColumnId);
        return (row, rowIndex) => {
          const value = readValue(row, rowIndex);
          if (typeof value !== "string") return null;
          const matcher = regex.matcher(value);
          if (!matcher.find() || transformation.groupIndex > regex.groupCount()) return null;
          return matcher.group(transformation.groupIndex);
        };
      },
    () => () => () => null,
  );
