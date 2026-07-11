import type { TocLink } from "@nuxt/content";

const getTocLinkIds = (links: TocLink[]): string[] =>
  links.flatMap((link) => [link.id, ...(link.children ? getTocLinkIds(link.children) : [])]);
// A section spans from its heading to the next heading, so every section overlapping the viewport is
// Highlighted — reading the content under one heading while the next heading is on screen highlights both.
export const useVisibleTocLinkIds = (links: MaybeRefOrGetter<TocLink[]>) => {
  const visibleIds = ref<string[]>([]);

  const updateVisibleIds = () => {
    const headings = getTocLinkIds(toValue(links)).flatMap((id) => {
      const element = window.document.getElementById(id);
      return element ? [{ element, id }] : [];
    });
    const firstHeading = headings[0];
    if (!firstHeading) return;
    // Headings set scroll-margin-top to clear the sticky app bar + category tabs, so reuse it as the
    // Effective top of the viewport instead of duplicating the offset here
    const viewportTop = Number.parseFloat(window.getComputedStyle(firstHeading.element).scrollMarginTop) || 0;
    const tops = headings.map(({ element }) => element.getBoundingClientRect().top);
    const newVisibleIds = headings.filter(({ id }, index) => {
      const sectionTop = tops[index] ?? 0;
      const sectionBottom = tops[index + 1] ?? Number.POSITIVE_INFINITY;
      return sectionBottom > viewportTop && sectionTop < window.innerHeight;
    });
    // Keep the last non-empty set (e.g. a long intro before the first heading) so the highlight never drops out
    if (newVisibleIds.length > 0) visibleIds.value = newVisibleIds.map(({ id }) => id);
  };

  useEventListener("scroll", updateVisibleIds, { passive: true });
  useEventListener("resize", updateVisibleIds, { passive: true });
  onMounted(updateVisibleIds);

  return visibleIds;
};
