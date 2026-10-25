import type { MarkWrapper } from "@/models/resource/note/serialize/MarkWrapper";

import { formatDestination } from "@/services/resource/note/serialize/formatDestination";

export const SPECIAL_CHARACTER_REGEX = /[\\`*_[\]<>~&!]/gu;
// The marker's own character is escaped (`1\.`, `\#`), so the line reads as its text
export const LINE_START_MARKER_REGEX = /^([ \t]*\d*)([#>+\-.)])(?=\s|$)/gm;
export const BACKTICK_RUN_REGEX = /`+/g;
export const BACKTICK_EDGE_REGEX = /^`|`$/;
// Innermost first, so a bold link reads as a link around bold text, and a link is what a reader sees at the edge
export const MARK_WRAPPERS: { type: string; wrap: MarkWrapper }[] = [
  { type: "bold", wrap: (text) => `**${text}**` },
  { type: "italic", wrap: (text) => `*${text}*` },
  { type: "strike", wrap: (text) => `~~${text}~~` },
  { type: "link", wrap: (text, mark) => `[${text}](${formatDestination(String(mark.attrs?.href ?? ""))})` },
];
