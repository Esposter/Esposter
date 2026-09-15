const FENCE_REGEX = /^```[\s\S]*?^```/gmu;
const BACKTICK_RUN_REGEX = /`+/gu;

// The prose of a page that cites: a fence is a program rather than a citation, and a span opened by two or more
// Backticks quotes a backticked phrase rather than citing what is inside it, so both go before the single-backtick
// Spans are read as citations. A span closes on the next run of exactly its own length, as markdown reads it — a
// Longer or shorter run inside it is literal text, which is what a hand-rolled pair count gets wrong.
export const getCitingText = (markdown: string): string => {
  const text = markdown.replaceAll(FENCE_REGEX, "");
  const runs = Array.from(text.matchAll(BACKTICK_RUN_REGEX), ({ 0: run, index }) => ({ index, length: run.length }));
  let citingText = "";
  let cursor = 0;

  for (let runIndex = 0; runIndex < runs.length; runIndex++) {
    const opener = runs[runIndex];
    if (opener === undefined) continue;

    const closerIndex = runs.findIndex(({ length }, index) => index > runIndex && length === opener.length);
    const closer = runs[closerIndex];
    if (closer === undefined) continue;

    const spanEnd = closer.index + closer.length;
    citingText += text.slice(cursor, opener.length === 1 ? spanEnd : opener.index);
    cursor = spanEnd;
    runIndex = closerIndex;
  }

  return citingText + text.slice(cursor);
};
