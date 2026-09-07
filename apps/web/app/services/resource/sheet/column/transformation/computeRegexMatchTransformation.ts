import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { RegexMatchTransformation } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";

import { getResult } from "@esposter/shared";

export const computeRegexMatchTransformation = (
  value: ColumnValue,
  transformation: RegexMatchTransformation,
): ColumnValue => {
  if (typeof value !== "string") return null;
  return getResult(() => new RegExp(transformation.pattern, "u").exec(value)).match(
    (match) => {
      if (!match) return null;
      return match[transformation.groupIndex] ?? null;
    },
    () => null,
  );
};
