// The hidden comments carry the bot's fingerprints and site lists, and the static-analysis block is the transcript
// Of every script it ran — tens of kilobytes per finding, none of it the finding
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/gu;
const STATIC_ANALYSIS_BLOCK_REGEX =
  /<details>\s*<summary>🔎 Supported by static analysis<\/summary>[\s\S]*?<\/details>/gu;
const BLANK_RUN_REGEX = /\n{3,}/gu;

// A finding as the reviewer wrote it — its reasoning, its proposed diff and the prompt block it addresses to an
// Agent — with the machinery around it removed. The drain reads this and nothing else: it holds no `gh`, so a
// Title alone would have it re-derive the case the reviewer already made
export const getFindingText = (body: string): string =>
  body
    .replaceAll(STATIC_ANALYSIS_BLOCK_REGEX, "")
    .replaceAll(HTML_COMMENT_REGEX, "")
    .replaceAll(BLANK_RUN_REGEX, "\n\n")
    .trim();
