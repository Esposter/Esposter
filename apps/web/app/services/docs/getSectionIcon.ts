// @unocss-include
import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";
import { getSlug } from "@/services/docs/getSlug";

export const getSectionIcon = (path: string) => DocsSectionIconMap[getSlug(path)] ?? "i-mdi:book-open-variant";
