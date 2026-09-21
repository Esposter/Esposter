// The closing fence is optional so a reply truncated mid-block drops it too, rather than reading the code aloud
const FENCED_CODE_REGEX = /```[\s\S]*?(?:```|$)/gu;
const INLINE_CODE_REGEX = /`(?<code>[^`]*)`/gu;
const LINK_REGEX = /\[(?<text>[^\]]*)\]\([^)]*\)/gu;
const LINE_PREFIX_REGEX = /^\s*(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s*)/u;
const TABLE_ROW_REGEX = /^\s*\|/u;
const EMPHASIS_REGEX = /[*_~]{1,3}/gu;
const WHITESPACE_RUN_REGEX = /\s+/gu;
// The engine reads English only: a sentence with no Latin letter reaches its tokenizer as unknown tokens and comes
// Back as near-silence, which the device ladder would take for a broken provider
const LATIN_LETTER_REGEX = /\p{Script=Latin}/u;

// A reply's prose as it would be read out, on one line: code, tables and markup are stripped first, because the
// Point of hearing a reply is knowing the turn ended and what it said, not hearing a diff read aloud. The whole
// Of it, since the reading is streamed a sentence at a time and the person hears the opening while the rest is
// Still being generated
export const getSpokenProse = (markdown: string): string => {
  const prose = markdown
    .replace(FENCED_CODE_REGEX, " ")
    .split("\n")
    .filter((line) => !TABLE_ROW_REGEX.test(line))
    .map((line) => line.replace(LINE_PREFIX_REGEX, ""))
    .join(" ")
    .replace(INLINE_CODE_REGEX, "$<code>")
    .replace(LINK_REGEX, "$<text>")
    .replace(EMPHASIS_REGEX, "")
    .replace(WHITESPACE_RUN_REGEX, " ")
    .trim();
  return LATIN_LETTER_REGEX.test(prose) ? prose : "";
};
