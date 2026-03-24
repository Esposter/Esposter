import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { RegexMatchTransformation } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";

export const computeRegexMatchTransformation = (
  value: ColumnValue,
  transformation: RegexMatchTransformation,
): ColumnValue => {
  if (typeof value !== "string") return null;
  try {
    const match = new RegExp(transformation.pattern).exec(value);
    if (!match) return null;
    return match[transformation.groupIndex] ?? null;
  } catch {
    return null;
  }
};
