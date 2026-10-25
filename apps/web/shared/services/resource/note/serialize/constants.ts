import type { MarkWrapper } from "#shared/models/resource/note/serialize/MarkWrapper";

import { formatDestination } from "#shared/services/resource/note/serialize/formatDestination";

export const SPECIAL_CHARACTER_REGEX = /[\\`*_[\]<>~&!]/gu;
// The marker's own character is escaped (`1\.`, `\#`), so the line reads as its text.
// A dash or equals run to the line's end is a rule or a setext underline, so its first character is escaped too
export const LINE_START_MARKER_REGEX = /^(?<indent>[ \t]*\d*)(?<marker>[#>+\-.)=])(?=\s|$|\k<marker>+\s*$)/gmu;
// A backslash cannot escape a space, so leading whitespace is written as character references
export const LINE_START_WHITESPACE_REGEX = /^[ \t]+/gmu;
export const BACKTICK_RUN_REGEX = /`+/g;
export const BACKTICK_EDGE_REGEX = /^`|`$/;
// Innermost first, so a bold link reads as a link around bold text, and a link is what a reader sees at the edge
export const MARK_WRAPPERS: { type: string; wrap: MarkWrapper }[] = [
  { type: "bold", wrap: (text) => `**${text}**` },
  { type: "italic", wrap: (text) => `*${text}*` },
  { type: "strike", wrap: (text) => `~~${text}~~` },
  { type: "link", wrap: (text, mark) => `[${text}](${formatDestination(String(mark.attrs?.href ?? ""))})` },
];
