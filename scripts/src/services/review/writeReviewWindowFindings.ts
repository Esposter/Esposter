import type { ReviewWindowFindings } from "#src/models/review/ReviewWindowFindings";

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Hands one window's findings to its fixer as `window-<index>.json` in the findings directory, the file `ai:review:fix`
// Reads. The matrix names the same index, so each fix job finds its own window's file.
export const writeReviewWindowFindings = (
  directory: string,
  windowIndex: number,
  findings: ReviewWindowFindings,
): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `window-${windowIndex}.json`), `${JSON.stringify(findings, undefined, 2)}\n`);
};
