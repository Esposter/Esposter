import { execFileSync } from "node:child_process";

// What the index listing and the staged blobs may print, a repository's whole tracked tree at most. Read locally
// Rather than from `services/shared/constants`, whose configuration import alone costs the hook most of a second
const MAX_OUTPUT_BYTES = 64 * 1024 ** 2;

// Runs git in the working directory, which the entry sets to the repository's top level. The environment is not
// Scrubbed: a pre-commit hook exports `GIT_INDEX_FILE` for the commit's own index, which is the one this check must read
export const runGitBytes = (args: string[], input?: string): Buffer =>
  execFileSync("git", args, { input, maxBuffer: MAX_OUTPUT_BYTES });
