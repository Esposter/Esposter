import { appendFileSync } from "node:fs";

// A job output is the only channel between two jobs of one workflow run, and the delayed retrigger is a second
// Job precisely so its wait does not hold the collector's concurrency group. Outside Actions the file is unset
// And the value has no reader, which is what makes a local run and a dry run write nothing.
export const writeJobOutput = (name: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  appendFileSync(file, `${name}=${value}\n`);
};
