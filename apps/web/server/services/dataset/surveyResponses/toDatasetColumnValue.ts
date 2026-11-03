import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";

const hasRecord = (list: unknown[]): boolean => list.some((item) => typeof item === "object" && item !== null);

export const toDatasetColumnValue = (value: unknown): ColumnValue => {
  if (value === null || value === undefined) return null;
  else if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") return value;
  else if (value instanceof Date) return value.toISOString();
  // A checkbox question's answers join into one cell, unless they are records a join would flatten
  else if (Array.isArray(value) && !hasRecord(value))
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join(CHECKBOX_ANSWER_SEPARATOR);
  // A record, or a list of records such as a dynamic matrix or panel's answer, is one value of compact JSON text
  else return JSON.stringify(value);
};
