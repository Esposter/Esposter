import { normalizeString } from "@esposter/shared";

export const getSourceColumnName = (sourceName: string, index: number): string =>
  normalizeString(sourceName) || `Column ${index + 1}`;
