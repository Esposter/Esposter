import type { VisualComparisonRecord } from "#src/models/VisualComparisonRecord";

import {
  MISMATCH_DETAIL_REGEX,
  MISMATCH_MESSAGE,
  MISMATCH_RATIO_BAR,
  MISSING_IMAGE_MESSAGE,
} from "#src/services/constants";

// The tally a visual suite keeps over its cases, in the one shape both suites read: a shot that differs from its image is
// Listed over the bar or counted within it, a missing image is counted apart, and any other failure (a render error, a
// Timeout) is thrown
export const createVisualComparisonRecord = (): VisualComparisonRecord => {
  // The mismatches over the bar, each with its title, and the cases counted apart from them
  const overBar: { pixels: number; ratio: number; title: string }[] = [];
  let withinBarCount = 0;
  let withoutImageCount = 0;

  return {
    recordFailure: (error, title) => {
      if (!(error instanceof Error)) throw error;
      const detail = MISMATCH_DETAIL_REGEX.exec(error.message)?.groups;
      if (error.message.includes(MISSING_IMAGE_MESSAGE)) withoutImageCount += 1;
      else if (!detail || !error.message.includes(MISMATCH_MESSAGE)) throw error;
      else if (Number(detail.ratio) > MISMATCH_RATIO_BAR)
        overBar.push({ pixels: Number(detail.pixels), ratio: Number(detail.ratio), title });
      else withinBarCount += 1;
    },
    recordWithinBar: () => {
      withinBarCount += 1;
    },
    report: () => {
      const summary = `${withinBarCount} within the bar${withoutImageCount > 0 ? `, ${withoutImageCount} with no image beside them` : ""}.`;
      if (overBar.length === 0) {
        console.log(`No case over ${MISMATCH_RATIO_BAR * 100}% of its image: ${summary}`);
        return;
      }

      // The matcher rounds each ratio up to a whole percent, so ties are ordered by the pixels that differ
      const rows = overBar
        .toSorted((first, second) => second.ratio - first.ratio || second.pixels - first.pixels)
        .map(({ ratio, title }) => `  ${String(Math.round(ratio * 100)).padStart(4)}%  ${title}`);
      console.log(
        [`Cases over ${MISMATCH_RATIO_BAR * 100}% of their image, worst first:`, ...rows, summary].join("\n"),
      );
    },
  };
};
