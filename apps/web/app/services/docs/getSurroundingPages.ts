import type { ContentNavigationItem } from "@nuxt/content";

export const getSurroundingPages = (
  pages: ContentNavigationItem[],
  path: string,
): [ContentNavigationItem | undefined, ContentNavigationItem | undefined] => {
  const index = pages.findIndex(({ path: pagePath }) => pagePath === path);
  return index === -1 ? [undefined, undefined] : [pages[index - 1], pages[index + 1]];
};
