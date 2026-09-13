// The hidden comments carry the bot's fingerprints and site lists, and the static-analysis block is the transcript
// Of every script it ran — tens of kilobytes per finding, none of it the finding
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/gu;
const STATIC_ANALYSIS_BLOCK_REGEX =
  /<details>\s*<summary>🔎 Supported by static analysis<\/summary>[\s\S]*?<\/details>/gu;
const BLANK_RUN_REGEX = /\n{3,}/gu;
// A capturing split keeps the fences, so the prose between them sits at the even indices and every fenced block
// At the odd ones
const FENCED_BLOCK_REGEX = /(?<fence>```[\s\S]*?```)/u;

// A finding as the reviewer wrote it — its reasoning, its proposed diff and the prompt block it addresses to an
// Agent — with the machinery around it removed. The drain reads this and nothing else: it holds no `gh`, so a
// Title alone would have it re-derive the case the reviewer already made.
//
// The comments are stripped from the prose alone. A proposed fix to a template or a markdown page carries HTML
// Comments of its own inside its fence, and a drain handed the diff with those lines missing applies a different
// Fix from the one the reviewer wrote. The bot's own comments never sit inside a fence, so the fence is the
// Boundary rather than a list of the comment shapes it writes, which grows with every release
export const getFindingText = (body: string): string =>
  body
    .replaceAll(STATIC_ANALYSIS_BLOCK_REGEX, "")
    .split(FENCED_BLOCK_REGEX)
    .map((segment, index) => (index % 2 === 0 ? segment.replaceAll(HTML_COMMENT_REGEX, "") : segment))
    .join("")
    .replaceAll(BLANK_RUN_REGEX, "\n\n")
    .trim();
