import type { DocsSearchSection } from "@/models/docs/DocsSearchSection";
import type { UiCommand } from "@/models/ui/UiCommand";

import { ContentCollection } from "#shared/models/content/ContentCollection";
import { DocsSearchSectionPropertyNames } from "@/models/docs/DocsSearchSection";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MAX_DOCS_SEARCH_RESULTS } from "@/services/docs/constants";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { getOrCreate } from "@esposter/shared";
import MiniSearch from "minisearch";

// The docs' search as the palette's scope for as long as a docs page is mounted, whichever of its search buttons —
// The sidebar's, or the narrow screen's toolbar — opens the palette
export const useDocsCommandScope = () => {
  const query = ref("");
  const { data: searchSections } = useAsyncData(
    AsyncDataKey.DocsSearchSections,
    () => queryCollectionSearchSections(ContentCollection.Docs),
    { server: false },
  );
  const miniSearch = computed(() => {
    const index = new MiniSearch<DocsSearchSection>({
      fields: [DocsSearchSectionPropertyNames.title, DocsSearchSectionPropertyNames.content],
      searchOptions: {
        boost: { [DocsSearchSectionPropertyNames.title]: 2 },
        combineWith: "AND",
        fuzzy: 0.2,
        prefix: true,
      },
      storeFields: [DocsSearchSectionPropertyNames.title, DocsSearchSectionPropertyNames.titles],
    });
    index.addAll(searchSections.value ?? []);
    return index;
  });
  // Group hits by page and keep only the best-scoring section per page (results arrive relevance-sorted),
  // So one page matching in many sections can't flood the list — the DocSearch/VitePress behavior
  const results = computed(() => {
    if (!query.value) return [];
    const pagePathResultsMap = new Map<string, UiCommand>();
    for (const searchResult of miniSearch.value.search(query.value)) {
      // MiniSearch's SearchResult carries its storeFields behind an `any` index signature, which satisfies no
      // Required property — so there is no overlap for a direct cast, and reading them bare would type as `any`.
      // The fields are the ones the index above was told to store
      // eslint-disable-next-line no-restricted-syntax -- A library result type that cannot express what it carries
      const { id, title, titles } = searchResult as unknown as Pick<DocsSearchSection, "id" | "title" | "titles">;
      const pagePath = id.split("#")[0] || id;
      getOrCreate(pagePathResultsMap, pagePath, () => ({
        description: titles.join(" › ") || pagePath,
        group: "Docs",
        id,
        meaning: UiIconMeaning.Docs,
        title,
        to: id,
      }));
      if (pagePathResultsMap.size === MAX_DOCS_SEARCH_RESULTS) break;
    }
    return [...pagePathResultsMap.values()];
  });

  useCommandScope({ commands: () => results.value, placeholder: "Search docs", query, title: "Docs" });
};
