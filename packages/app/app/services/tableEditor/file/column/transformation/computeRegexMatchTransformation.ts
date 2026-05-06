import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { RegexMatchTransformation } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";

import { getResult } from "@esposter/shared";

export const computeRegexMatchTransformation = (
  value: ColumnValue,
  transformation: RegexMatchTransformation,
): ColumnValue => {
  if (typeof value !== "string") return null;
  return getResult(() => new RegExp(transformation.pattern).exec(value)).match(
    (match) => {
      if (!match) return null;
      return match[transformation.groupIndex] ?? null;
    },
    () => null,
  );
};
