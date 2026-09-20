const WHITESPACE_RUN_REGEX = /\s+/gu;
// Templates, tags and bold markers dropped, a link reduced to its label
const WIKI_MARKUP_REGEX = /\{\{[^}]*\}\}|<[^>]+>|'''/gu;
const WIKI_LINK_REGEX = /\[\[(?:[^\]|]*\|)?(?<label>[^\]]*)\]\]/gu;

// A line's text as a person reads it, off the wiki's markup or the game data's, which carries the same
export const getPlainLineText = (text: string): string =>
  text
    .replaceAll(WIKI_MARKUP_REGEX, "")
    .replaceAll(WIKI_LINK_REGEX, "$<label>")
    .replaceAll("&mdash;", "—")
    .replaceAll(WHITESPACE_RUN_REGEX, " ")
    .trim();
