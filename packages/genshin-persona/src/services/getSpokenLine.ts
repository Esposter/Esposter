import { checkIsReadable } from "#src/services/checkIsReadable";
import { collapseWhitespace } from "#src/services/collapseWhitespace";
import { getLineContent } from "#src/services/getLineContent";

// A spoken line may be a list item, so its marker is layout rather than words
const LIST_MARKER_REGEX = /^(?:[-+]|\d+\.)\s+/u;
const INLINE_CODE_REGEX = /`(?<code>[^`]*)`/gu;
const LINK_REGEX = /\[(?<text>[^\]]*)\]\([^)]*\)/gu;
const EMPHASIS_REGEX = /[*_~]{1,3}/gu;
// One line of a reply as it would be read out — the markup the style forbids stripped anyway — or nothing for a line
// That is not a spoken line or that the engine cannot read. The output style's one rule: a blockquote line is the
// Character's spoken line, and nothing else is written as one. Whether a line sits inside a fence is the reader's,
// Since it depends on the lines before it
export const getSpokenLine = (line: string): string | undefined => {
  if (!line.trimStart().startsWith(">")) return undefined;

  const spokenLine = collapseWhitespace(
    getLineContent(line)
      .replace(LIST_MARKER_REGEX, "")
      .replaceAll(INLINE_CODE_REGEX, "$<code>")
      .replaceAll(LINK_REGEX, "$<text>")
      .replaceAll(EMPHASIS_REGEX, ""),
  );
  return checkIsReadable(spokenLine) ? spokenLine : undefined;
};
