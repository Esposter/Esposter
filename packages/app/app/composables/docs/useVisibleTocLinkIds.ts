import type { TocLink } from "@nuxt/content";

import { getVisibleSectionIds } from "@/services/docs/getVisibleSectionIds";

const getTocLinkIds = (links: TocLink[]): string[] =>
  links.flatMap((link) => [link.id, ...(link.children ? getTocLinkIds(link.children) : [])]);
// A section spans from its heading to the next heading, so every section overlapping the viewport is
// Highlighted — reading the content under one heading while the next heading is on screen highlights both.
//
// Driven by an observer rather than by the scroll event, because the set changes at exactly one kind of moment:
// A heading crossing an edge of the effective viewport. Those crossings are the observer's own callbacks, so
// There is nothing to look for in between — where a scroll listener re-measured every heading several hundred
// Times per section to find the handful of frames where the answer had moved.
export const useVisibleTocLinkIds = (links: MaybeRefOrGetter<TocLink[]>) => {
  const visibleIds = ref<string[]>([]);
  const headings = shallowRef<{ element: HTMLElement; id: string }[]>([]);
  // Headings set scroll-margin-top to clear the sticky app bar, so reuse it as the effective top of the
  // Viewport instead of duplicating the offset here — it is both the observer's top inset and the line a
  // Section has to reach past to count as visible
  const viewportTop = computed(() => {
    const firstHeading = headings.value.at(0);
    if (!firstHeading) return 0;
    // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("112px"), Number() would be NaN
    return Number.parseFloat(window.getComputedStyle(firstHeading.element).scrollMarginTop) || 0;
  });
  const updateVisibleIds = () => {
    if (headings.value.length === 0) return;

    const newVisibleIds = getVisibleSectionIds(
      headings.value.map(({ element, id }) => ({ id, top: element.getBoundingClientRect().top })),
      viewportTop.value,
      window.innerHeight,
    );
    // Keep the last non-empty set (e.g. a long intro before the first heading) so the highlight never drops out,
    // And assign only when it actually moved: a fresh array invalidates every item's `isActive` and makes the
    // Slide indicator remeasure the whole list on the next tick, which reads layout
    const isUnchanged =
      newVisibleIds.length === visibleIds.value.length &&
      newVisibleIds.every((id, index) => id === visibleIds.value[index]);
    if (newVisibleIds.length > 0 && !isUnchanged) visibleIds.value = newVisibleIds;
  };
  // After render, so the headings the content renderer produced are in the document — and again if the page's
  // Own links change under a mount, which the keyed docs route makes rare rather than impossible
  watchPostEffect(() => {
    headings.value = getTocLinkIds(toValue(links)).flatMap((id) => {
      const element = window.document.getElementById(id);
      return element ? [{ element, id }] : [];
    });
    updateVisibleIds();
  });

  useIntersectionObserver(
    () => headings.value.map(({ element }) => element),
    () => {
      updateVisibleIds();
    },
    { rootMargin: () => `-${viewportTop.value}px 0px 0px 0px` },
  );
  // The observer reports a heading crossing the viewport's edges, never the edges themselves moving — and a
  // Resize moves the bottom one, which is half of what decides the set
  useEventListener(
    "resize",
    () => {
      updateVisibleIds();
    },
    { passive: true },
  );

  return visibleIds;
};
