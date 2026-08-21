interface SectionHeading {
  id: string;
  top: number;
}
// A section spans from its own heading down to the next one, so the last runs to the bottom of the document.
// Both bounds are open on one side deliberately: a heading sitting exactly on the viewport's top line has
// Scrolled past, and one sitting exactly on the bottom has not arrived
export const getVisibleSectionIds = (headings: SectionHeading[], viewportTop: number, viewportHeight: number) =>
  headings
    .filter(({ top }, index) => {
      const sectionBottom = headings[index + 1]?.top ?? Number.POSITIVE_INFINITY;
      return sectionBottom > viewportTop && top < viewportHeight;
    })
    .map(({ id }) => id);
