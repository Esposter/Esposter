import { checkIsReadable } from "#src/services/checkIsReadable";

// The closing fence is optional so a piece cut mid-block drops the rest of it too, rather than reading code aloud
const FENCED_CODE_REGEX = /```[\s\S]*?(?:```|$)/gu;
// The output style's one rule: a blockquote line is the character's spoken line, and nothing else is written as one
const SPOKEN_LINE_REGEX = /^\s*>\s?(?<line>.*)$/u;
const INLINE_CODE_REGEX = /`(?<code>[^`]*)`/gu;
const LINK_REGEX = /\[(?<text>[^\]]*)\]\([^)]*\)/gu;
const EMPHASIS_REGEX = /[*_~]{1,3}/gu;
const WHITESPACE_RUN_REGEX = /\s+/gu;

// The spoken lines in a piece of a reply, as they would be read out — the markup the style forbids stripped
// Anyway, and only the lines the engine can read, gated here so a piece with none never wakes it. Stateless on
// Purpose: the tool flushes a reply at line breaks, so a spoken line arrives whole in one piece
export const getSpokenLines = (markdown: string): string[] =>
  markdown
    .replace(FENCED_CODE_REGEX, "")
    .split("\n")
    .map((line) =>
      (SPOKEN_LINE_REGEX.exec(line)?.groups?.line ?? "")
        .replace(INLINE_CODE_REGEX, "$<code>")
        .replace(LINK_REGEX, "$<text>")
        .replace(EMPHASIS_REGEX, "")
        .replace(WHITESPACE_RUN_REGEX, " ")
        .trim(),
    )
    .filter((line) => checkIsReadable(line));
