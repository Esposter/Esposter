interface SectionHeading {
  id: string;
  top: number;
}
// A section spans from its own heading down to the next one, so the last runs to the bottom of the document.
// Both bounds are open on one side deliberately: a heading sitting exactly on the viewport's top line has
// Scrolled past, and one sitting exactly on the bottom has not arrived.
//
// The top bound is compared in whole pixels because an anchor lands its heading exactly on that line, give or
// Take the sub-pixel rounding of the scroll. The sliver of the section above that leaves behind is not
// Something anyone can see, and counting it made clicking a link light up the section before the one clicked
export const getVisibleSectionIds = (headings: SectionHeading[], viewportTop: number, viewportHeight: number) =>
  headings
    .filter(({ top }, index) => {
      const sectionBottom = headings[index + 1]?.top ?? Number.POSITIVE_INFINITY;
      return sectionBottom - viewportTop >= 1 && top < viewportHeight;
    })
    .map(({ id }) => id);
