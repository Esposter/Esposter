import type { ContentNavigationItem } from "@nuxt/content";

export interface DocsNavigationGroup {
  items: ContentNavigationItem[];
  // Undefined for the leading ungrouped run so it renders without a subheader
  title?: string;
}
