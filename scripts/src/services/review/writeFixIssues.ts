import { appendFileSync } from "node:fs";

// The issues that go to fixers, as the review job's `fix_issues` output: a JSON array of issue numbers the fix matrix reads.
// Outside Actions the variable is unset, and the array has no reader.
export const writeFixIssues = (issueNumbers: number[]): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  appendFileSync(file, `fix_issues=${JSON.stringify(issueNumbers)}\n`);
};
