interface SectionAnchor {
  id: string;
  top: number;
}
// A section spans from its own anchor down to the next one, so the last runs to the bottom of the document.
// Both bounds are open on one side deliberately: an anchor sitting exactly on the viewport's top line has
// Scrolled past, and one sitting exactly on the bottom has not arrived. Both bounds are in viewport coordinates,
// So a panel that scrolls itself passes its own box rather than the window's.
//
// The top bound is compared in whole pixels because an anchor lands exactly on that line, give or
// Take the sub-pixel rounding of the scroll. The sliver of the section above that leaves behind is not
// Something anyone can see, and counting it lights up the section before the one the link was clicked for
export const getVisibleSectionIds = (sections: SectionAnchor[], viewportTop: number, viewportBottom: number) =>
  sections
    .filter(({ top }, index) => {
      const sectionBottom = sections[index + 1]?.top ?? Number.POSITIVE_INFINITY;
      return sectionBottom - viewportTop >= 1 && top < viewportBottom;
    })
    .map(({ id }) => id);
