import type { ResourceSearchItem } from "#src/models/resource/search/ResourceSearchItem";

import { PageSearchItems } from "#src/services/resource/search/PageSearchItems";
import { searchItems } from "#src/services/search/searchItems";

export const getPageSearchItems = (searchQuery: string): ResourceSearchItem[] =>
  searchItems(PageSearchItems, searchQuery, ({ title }) => ({ title }));
