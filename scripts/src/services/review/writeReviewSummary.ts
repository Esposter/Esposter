import { appendFileSync } from "node:fs";

// The run's summary on the workflow's step page, when the runner has one. Outside Actions the variable is unset and the
// summary has no reader, which is what makes a local run write nothing.
export const writeReviewSummary = (lines: string[]): void => {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  appendFileSync(file, `${lines.join("\n")}\n`);
};
