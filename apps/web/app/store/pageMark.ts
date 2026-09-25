import type { PageLink } from "#shared/models/app/PageLink";

// The mark each mounted page declares, found by the path it is at. A page registers while it is mounted and leaves
// With it, and a page swap mounts the next page before the last one leaves, so the page mounted last is read first
export const usePageMarkStore = defineStore("pageMark", () => {
  const pageMarkGetters = shallowRef<(() => Pick<PageLink, "mark" | "path">)[]>([]);
  const getPageMark = (path: string) =>
    pageMarkGetters.value
      .map((pageMarkGetter) => pageMarkGetter())
      .findLast((pageMarkEntry) => pageMarkEntry.path === path)?.mark;
  const registerPageMark = (newPageMarkGetter: () => Pick<PageLink, "mark" | "path">) => {
    pageMarkGetters.value = [...pageMarkGetters.value, newPageMarkGetter];
    return () => {
      pageMarkGetters.value = pageMarkGetters.value.filter((pageMarkGetter) => pageMarkGetter !== newPageMarkGetter);
    };
  };
  return { getPageMark, registerPageMark };
});
