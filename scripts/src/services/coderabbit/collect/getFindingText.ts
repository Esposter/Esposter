// The hidden comments carry the bot's fingerprints and site lists, and the static-analysis block is the transcript
// Of every script it ran — tens of kilobytes per finding, none of it the finding
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/gu;
const STATIC_ANALYSIS_BLOCK_REGEX =
  /<details>\s*<summary>🔎 Supported by static analysis<\/summary>[\s\S]*?<\/details>/gu;
const BLANK_RUN_REGEX = /\n{3,}/gu;
// A capturing split keeps the fences, so the prose between them sits at the even indices and every fenced block
// At the odd ones
const FENCED_BLOCK_REGEX = /(?<fence>```[\s\S]*?```)/u;

// A finding as the reviewer wrote it, with the machinery around it removed — the drain holds no `gh`, so a title
// Alone would have it re-derive the case. Comments are stripped from the prose alone: a proposed fix to a
// Template carries HTML comments of its own inside its fence, and the bot's never sit inside one.
export const getFindingText = (body: string): string =>
  body
    .replaceAll(STATIC_ANALYSIS_BLOCK_REGEX, "")
    .split(FENCED_BLOCK_REGEX)
    .map((segment, index) => (index % 2 === 0 ? segment.replaceAll(HTML_COMMENT_REGEX, "") : segment))
    .join("")
    .replaceAll(BLANK_RUN_REGEX, "\n\n")
    .trim();
