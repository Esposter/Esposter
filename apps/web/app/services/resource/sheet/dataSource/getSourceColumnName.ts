import { normalizeString } from "@esposter/shared";

export const getSourceColumnName = (sourceName: string, index: number) =>
  normalizeString(sourceName) || `Column ${index + 1}`;
