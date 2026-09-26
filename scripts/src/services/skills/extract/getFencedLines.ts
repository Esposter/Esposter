// A fence opens on three or more backticks or tildes and closes on a run of the same character at least as long, as
// Markdown reads it — the rule `getCitingText` strips fences by
const FENCE_REGEX = /^[ \t]*(?<fence>`{3,}|~{3,})/u;
// Whether each line belongs to a fenced block, its fence lines included
export const getFencedLines = (lines: string[]): boolean[] => {
  let openingFence: string | undefined;
  return lines.map((line) => {
    const fence = FENCE_REGEX.exec(line)?.groups?.fence;
    if (openingFence === undefined) {
      if (fence === undefined) return false;
      openingFence = fence;
    } else if (fence?.startsWith(openingFence) && line.trim() === fence) openingFence = undefined;
    return true;
  });
};
