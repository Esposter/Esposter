import { OPENSPEC_SPEC_PATHSPEC } from "#src/services/openspec/constants";
import { lintScenarios } from "#src/services/openspec/lintScenarios";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every tracked or new spec in the repository, read from the working tree, so a spec being written is checked before
// it is committed.
export const readSpecFindings = (): string[] =>
  readSweepFilePaths(OPENSPEC_SPEC_PATHSPEC).flatMap((path) =>
    lintScenarios(path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")),
  );
