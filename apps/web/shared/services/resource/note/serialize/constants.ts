import type { MarkWrapper } from "#shared/models/resource/note/serialize/MarkWrapper";

import { formatDestination } from "#shared/services/resource/note/serialize/formatDestination";
import { wrapEmphasis } from "#shared/services/resource/note/serialize/wrapEmphasis";

export const SPECIAL_CHARACTER_REGEX = /[\\`*_[\]<>~&!]/gu;
// The marker's own character is escaped (`1\.`, `\#`), so the line reads as its text.
// A dash or equals run to the line's end is a rule or a setext underline, so its first character is escaped too
export const LINE_START_MARKER_REGEX = /^(?<indent>[ \t]*\d*)(?<marker>[#>+\-.)=])(?=\s|$|\k<marker>+\s*$)/gmu;
// A backslash cannot escape a space, so leading whitespace is written as character references
export const LINE_START_WHITESPACE_REGEX = /^[ \t]+/gmu;
export const BACKTICK_RUN_REGEX = /`+/gu;
export const BACKTICK_EDGE_REGEX = /^`|`$/u;
// A code span whose text starts and ends with a space, and holds another character, loses one from each side on read-back, so it is padded
// A span of only spaces keeps them all on read-back, so it is not
export const SPACE_EDGE_REGEX = /^ .*[^ ].* $/su;
// A closing hash run ends a heading unless it is escaped, so the last hash of a heading's text is
export const HEADING_CLOSING_HASH_REGEX = /#(?=\s*$)/u;
// Innermost first, so a bold link reads as a link around bold text, and a link is what a reader sees at the edge
export const MARK_WRAPPERS: { type: string; wrap: MarkWrapper }[] = [
  { type: "bold", wrap: wrapEmphasis("**") },
  { type: "italic", wrap: wrapEmphasis("*") },
  { type: "strike", wrap: wrapEmphasis("~~") },
  { type: "link", wrap: (text, mark) => `[${text}](${formatDestination(String(mark.attrs?.href ?? ""))})` },
];
