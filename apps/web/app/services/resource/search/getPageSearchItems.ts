import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { PageSearchItems } from "@/services/resource/search/PageSearchItems";

export const getPageSearchItems = (searchQuery: string): ResourceSearchItem[] => {
  const query = searchQuery.toLowerCase();
  return PageSearchItems.filter(({ title }) => title.toLowerCase().includes(query));
};
