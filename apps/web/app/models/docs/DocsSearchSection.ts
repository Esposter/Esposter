import type { PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

// Shape of queryCollectionSearchSections results, doubling as the MiniSearch document type
export interface DocsSearchSection {
  content: string;
  id: string;
  level: number;
  title: string;
  titles: string[];
}

export const DocsSearchSectionPropertyNames: PropertyNames<DocsSearchSection> = getPropertyNames<DocsSearchSection>();
