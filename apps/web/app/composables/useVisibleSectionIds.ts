import { getVisibleSectionIds } from "@/services/shared/getVisibleSectionIds";
// The one scrollspy behind every section-navigation sidebar — the docs table of contents, the user settings page,
// The settings dialog. A section spans from its own anchor element down to the next one, so every section
// Overlapping the viewport is highlighted: reading the body under one heading while the next heading is on screen
// Highlights both, which is what lets the rail stretch rather than point.
//
// Driven by an observer rather than by the scroll event, because the set changes at exactly one kind of moment: an
// Anchor crossing an edge of the effective viewport. Those crossings are the observer's own callbacks, so there is
// Nothing to look for in between — where a scroll listener re-measured every anchor several hundred times per
// Section to find the handful of frames where the answer had moved.
export const useVisibleSectionIds = (
  sectionIds: MaybeRefOrGetter<string[]>,
  // The id of the scroll container, for sections that scroll inside a panel rather than with the page. Taken as an
  // Id rather than an element because the container is rendered by a sibling that mounts after this caller does.
  containerId?: string,
) => {
  const visibleIds = ref<string[]>([]);
  const sections = shallowRef<HTMLElement[]>([]);
  const container = shallowRef<HTMLElement>();
  const documentBody = shallowRef<HTMLElement>();
  // Sections set scroll-margin-top to clear the sticky app bar, so reuse it as the effective top of the viewport
  // Instead of duplicating the offset here — it is both the observer's top inset and the line a section has to
  // Reach past to count as visible. A panel needs neither: its own box is the band, and the observer rooted on it
  // Already clips at those edges.
  const getViewportBounds = () => {
    if (container.value) {
      const { bottom, top } = container.value.getBoundingClientRect();
      return { bottom, top };
    }

    const firstSection = sections.value.at(0);
    // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("112px"), Number() would be NaN
    const scrollMarginTop = firstSection ? Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) : 0;
    return { bottom: window.innerHeight, top: scrollMarginTop || 0 };
  };
  const updateVisibleIds = () => {
    const { bottom, top } = getViewportBounds();
    const newVisibleIds = getVisibleSectionIds(
      sections.value.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top })),
      top,
      bottom,
    );
    // Keep the last non-empty set (e.g. a long intro before the first section, a panel still resolving) so the
    // Highlight never drops out, and assign only when it actually moved: a fresh array invalidates every item's
    // Active state and makes the slide indicator remeasure the whole list on the next tick, which reads layout
    const isUnchanged =
      newVisibleIds.length === visibleIds.value.length &&
      newVisibleIds.every((id, index) => id === visibleIds.value[index]);
    if (newVisibleIds.length > 0 && !isUnchanged) visibleIds.value = newVisibleIds;
  };
  const previousSectionIds = shallowRef<string[]>([]);
  const resolveSections = () => {
    const newSectionIds = toValue(sectionIds);
    const hasSectionIdsChanged =
      newSectionIds.length !== previousSectionIds.value.length ||
      newSectionIds.some((id, index) => id !== previousSectionIds.value[index]);
    // Copied, not aliased: a caller passing a ref it mutates in place would otherwise hand the same array to
    // Both sides of this comparison, and the change would read as no change at all
    previousSectionIds.value = [...newSectionIds];

    documentBody.value = window.document.body;
    if (containerId) container.value = window.document.getElementById(containerId) ?? undefined;

    const newSections = newSectionIds.flatMap((id) => {
      const element = window.document.getElementById(id);
      return element ? [element] : [];
    });
    if (hasSectionIdsChanged) visibleIds.value = [];
    const isUnchanged =
      newSections.length === sections.value.length &&
      newSections.every((section, index) => section === sections.value[index]);
    if (isUnchanged && !hasSectionIdsChanged) return;

    sections.value = newSections;
    updateVisibleIds();
  };

  // After render, so the sections the page rendered are in the document — and again whenever the ids change
  watchPostEffect(resolveSections);
  // Sections that arrive later than this composable does: a settings panel resolving its Suspense, a card
  // Rendering behind a skeleton. Nothing else would ever look for them again, and an id that resolves to no
  // Element is simply absent from the set rather than an error, so the sidebar would sit on a stale highlight
  useMutationObserver(documentBody, resolveSections, { childList: true, subtree: true });
  useIntersectionObserver(sections, updateVisibleIds, {
    root: container,
    rootMargin: () => (container.value ? "0px" : `-${getViewportBounds().top}px 0px 0px 0px`),
  });
  // The observer reports a section crossing the viewport's edges, never the edges themselves moving — and a resize
  // Moves the bottom one, which is half of what decides the set.
  //
  // `scrollend` covers the observer's other blind spot: an anchor stops with its section resting exactly on the top
  // Line, an arrival the observer never sees, because the section approaches that line from below and never
  // Crosses it. The last crossing before it is the previous section leaving, which would otherwise leave a
  // Clicked link highlighting the section above the one it named
  useEventListener(["resize", "scrollend"], updateVisibleIds, { passive: true });
  // A panel scrolls itself, and its scrollend never reaches the window
  useEventListener(container, "scrollend", updateVisibleIds, { passive: true });
  return visibleIds;
};
