import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { describe } from "vitest";

// Makes a temp dir a git repository, which is what a source-tree hash needs to exist at all — quiet, so the
// Init banner never reaches the runner's output
export const initRepository = (directory: string): void => {
  execFileHidden("git", ["init", "-q"], { cwd: directory });
};

describe.todo("initRepository");
