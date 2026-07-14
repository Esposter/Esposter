import { normalizeString } from "@esposter/shared";

export const parseClipboardValuesByPosition = (text: string): string[][] =>
  text
    .split(/\r?\n/u)
    .filter((line) => normalizeString(line) !== "")
    .map((line) => line.split("\t"));
