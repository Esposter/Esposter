import { DocsCategory } from "@/models/docs/DocsCategory";
import { DocsCategorySectionsMap } from "@/services/docs/DocsCategorySectionsMap";
import { getSlug } from "@/services/docs/getSlug";

const SectionCategoryMap = new Map<string, DocsCategory>(
  Object.entries(DocsCategorySectionsMap).flatMap(([category, slugs]) =>
    slugs.map((slug) => [slug, category] as const),
  ),
);
// Every section is mapped, which DocsCategorySectionsMap.test holds to the tree; the fallback only answers the lookup
export const getSectionCategory = (path: string) => SectionCategoryMap.get(getSlug(path)) ?? DocsCategory.Products;
