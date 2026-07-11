import type { ContentNavigationItem } from "@nuxt/content";

export const getSurroundingPages = (
  pages: ContentNavigationItem[],
  path: string,
): [ContentNavigationItem | null, ContentNavigationItem | null] => {
  const index = pages.findIndex(({ path: pagePath }) => pagePath === path);
  return index === -1 ? [null, null] : [pages[index - 1] ?? null, pages[index + 1] ?? null];
};
