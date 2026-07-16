import { DocsCategory } from "@/models/docs/DocsCategory";
import { DocsCategorySectionsMap } from "@/services/docs/DocsCategorySectionsMap";

const SectionCategoryMap = new Map<string, DocsCategory>(
  Object.entries(DocsCategorySectionsMap).flatMap(([category, slugs]) =>
    slugs.map((slug) => [slug, category] as const),
  ),
);

// New sections not yet mapped are almost always product areas
export const getSectionCategory = (path: string): DocsCategory =>
  SectionCategoryMap.get(path.split("/").at(-1) ?? "") ?? DocsCategory.Products;
