import { splitNonEmptyLines } from "#src/services/resource/sheet/commands/splitNonEmptyLines";

export const parseClipboardValuesByPosition = (text: string) =>
  splitNonEmptyLines(text).map((line) => line.split("\t"));
