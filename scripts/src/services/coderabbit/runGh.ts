import { execFileSync } from "node:child_process";

// A paginated slurp of a long-lived pull request's comments runs to megabytes, and the default buffer throws
// ENOBUFS rather than truncating — a failure that reads as `gh` being broken from the call site.
const MAX_BUFFER_BYTES = 256 * 1024 * 1024;

export const runGh = (args: string[]): string =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES });
