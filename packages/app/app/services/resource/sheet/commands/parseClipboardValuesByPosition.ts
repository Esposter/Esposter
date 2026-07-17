import { normalizeString } from "@esposter/shared";

export const parseClipboardValuesByPosition = (text: string): string[][] =>
  text
    .split(/\r?\n/u)
    .filter((line) => Boolean(normalizeString(line)))
    .map((line) => line.split("\t"));
