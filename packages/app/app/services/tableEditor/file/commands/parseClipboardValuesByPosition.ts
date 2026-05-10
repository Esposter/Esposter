import { normalizeString } from "@esposter/shared";

export const parseClipboardValuesByPosition = (text: string): string[][] =>
  text
    .split(new RegExp(String.raw`\r?\n`, "u"))
    .filter((line) => normalizeString(line) !== "")
    .map((line) => line.split("\t"));
