import { normalizeString } from "@esposter/shared";

export const splitNonEmptyLines = (text: string): string[] =>
  text.split(/\r?\n/u).filter((line) => Boolean(normalizeString(line)));
