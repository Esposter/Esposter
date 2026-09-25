import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { PageSearchItems } from "@/services/resource/search/PageSearchItems";
import { searchItems } from "@/services/search/searchItems";

export const getPageSearchItems = (searchQuery: string): ResourceSearchItem[] =>
  searchItems(PageSearchItems, searchQuery, ({ title }) => ({ title }));
