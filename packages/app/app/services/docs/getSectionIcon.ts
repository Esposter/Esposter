import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";

export const getSectionIcon = (path: string) =>
  DocsSectionIconMap[path.split("/").at(-1) ?? ""] ?? "mdi-book-open-variant";
