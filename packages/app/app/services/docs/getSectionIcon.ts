import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";
import { getSlug } from "@/services/docs/getSlug";

export const getSectionIcon = (path: string) => DocsSectionIconMap[getSlug(path)] ?? "mdi-book-open-variant";
