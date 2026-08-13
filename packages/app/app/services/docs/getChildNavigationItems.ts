import type { ContentNavigationItem } from "@nuxt/content";

// @nuxt/content lists a directory's own index.md as a child sharing the directory's path,
// Which the sidebar renders as the group's "Overview" item instead of a nested entry
export const getChildNavigationItems = ({ children, path }: ContentNavigationItem): ContentNavigationItem[] =>
  (children ?? []).filter((child) => child.path !== path);
