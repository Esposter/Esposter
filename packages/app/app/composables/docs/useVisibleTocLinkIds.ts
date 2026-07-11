import type { TocLink } from "@nuxt/content";

const getTocLinkIds = (links: TocLink[]): string[] =>
  links.flatMap((link) => [link.id, ...(link.children ? getTocLinkIds(link.children) : [])]);

// Tracks every heading currently on screen so the table of contents can highlight all of them.
// The last non-empty set is kept when scrolling between headings so the highlight never drops out.
export const useVisibleTocLinkIds = (links: MaybeRefOrGetter<TocLink[]>) => {
  const visibleIds = ref<string[]>([]);
  const intersectingIds = new Set<string>();
  let observer: IntersectionObserver | undefined;

  onMounted(() => {
    const ids = getTocLinkIds(toValue(links));
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) intersectingIds.add(entry.target.id);
          else intersectingIds.delete(entry.target.id);
        if (intersectingIds.size > 0) visibleIds.value = ids.filter((id) => intersectingIds.has(id));
      },
      { rootMargin: "0% 0% -30% 0%" },
    );
    for (const id of ids) {
      const element = window.document.getElementById(id);
      if (element) observer.observe(element);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return visibleIds;
};
