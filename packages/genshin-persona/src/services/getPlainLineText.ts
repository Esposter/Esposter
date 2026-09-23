import { collapseWhitespace } from "#src/services/collapseWhitespace";

// Templates, tags and bold markers dropped, a link reduced to its label
const WIKI_MARKUP_REGEX = /\{\{[^}]*\}\}|<[^>]+>|'''/gu;
const WIKI_LINK_REGEX = /\[\[(?:[^\]|]*\|)?(?<label>[^\]]*)\]\]/gu;
// A strip closes markup up out of what surrounded it — `<'''script` loses its bold marker and reads as a tag
// Opener — so it repeats until the text stops changing rather than trusting one pass, and it terminates because
// Every replacement is shorter than the markup it matched
const stripWikiMarkup = (text: string): string => {
  let previous = "";
  let stripped = text;
  while (previous !== stripped) {
    previous = stripped;
    stripped = stripped.replaceAll(WIKI_MARKUP_REGEX, "");
  }

  return stripped;
};
// A line's text as a person reads it, off the wiki's markup or the game data's, which carries the same
export const getPlainLineText = (text: string): string =>
  collapseWhitespace(stripWikiMarkup(text).replaceAll(WIKI_LINK_REGEX, "$<label>").replaceAll("&mdash;", "—"));
