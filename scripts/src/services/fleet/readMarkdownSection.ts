// A section runs to the next level-two heading, which ends it
const SECTION_END_REGEX = /^## /mu;

// The text under a level-two heading, or nothing when the text has no such heading. A page may hold only some of its sections
export const readMarkdownSection = (text: string, heading: string): string =>
  (text.split(heading)[1] ?? "").split(SECTION_END_REGEX)[0] ?? "";
