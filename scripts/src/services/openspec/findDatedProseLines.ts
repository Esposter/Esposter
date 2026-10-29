import { ADDRESS_REGEX, CODE_SPAN_REGEX, DATED_PROSE_REGEX, FENCE_REGEX } from "#src/services/openspec/constants";

// The one-based lines of a Markdown doc that say a date in prose. A fenced block is skipped whole, and a line's URLs,
// link targets and code spans are taken out before the date is looked for, since those quote a place or a name
export const findDatedProseLines = (markdown: string): number[] => {
  const lines: number[] = [];
  let isInFence = false;
  for (const [index, text] of markdown.split(/\r?\n/u).entries()) {
    if (FENCE_REGEX.test(text)) isInFence = !isInFence;
    else if (!isInFence && DATED_PROSE_REGEX.test(text.replaceAll(ADDRESS_REGEX, "").replaceAll(CODE_SPAN_REGEX, "")))
      lines.push(index + 1);
  }
  return lines;
};
