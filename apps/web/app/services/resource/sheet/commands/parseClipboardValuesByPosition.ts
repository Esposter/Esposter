import { splitNonEmptyLines } from "@/services/resource/sheet/commands/splitNonEmptyLines";

export const parseClipboardValuesByPosition = (text: string) =>
  splitNonEmptyLines(text).map((line) => line.split("\t"));
