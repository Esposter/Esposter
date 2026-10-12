import { appendFileSync } from "node:fs";

// The windows that go to fixers, as the review job's `fix_windows` output: a JSON array the fix matrix reads. Outside
// Actions the variable is unset, and the array has no reader.
export const writeFixWindows = (windowIndices: number[]): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  appendFileSync(file, `fix_windows=${JSON.stringify(windowIndices)}\n`);
};
